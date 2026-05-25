/**
 * File: workoutPlanController.js
 * Purpose: Handles the custom workout plan generator feature.
 *
 * Main responsibilities:
 * 1. Check if the logged-in user is allowed to generate a workout plan.
 * 2. Detect whether the user has an active membership.
 * 3. Apply a free daily usage limit for non-membership users.
 * 4. Generate a personalized workout plan based on:
 *    - goal
 *    - body part
 *    - fitness level
 *    - workout duration
 *    - available equipment
 * 5. Store and update daily workout plan usage in MongoDB.
 *
 * Access logic:
 * - Free users can generate only 2 plans per day.
 * - Membership users can generate unlimited plans.
 */

import WorkoutPlanUsage from "../models/WorkoutPlanUsage.js";
import { getActiveMembership } from "../utils/membershipChecker.js";

const FREE_DAILY_LIMIT = 2;

/**
 * Creates a daily date key in YYYY-MM-DD format.
 *
 * Why this is needed:
 * - The app must track workout-plan usage separately for each day.
 * - Example: if the user generates 2 plans today, tomorrow they should get a fresh limit again.
 * - The generated key is saved inside WorkoutPlanUsage as dateKey.
 *
 * Example output:
 * - 2026-05-23
 */
const getDateKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

/**
 * Normalizes text received from frontend requests.
 *
 * This protects the generator from mismatched values caused by spaces or uppercase letters.
 * For example:
 * - " Muscle_Gain " becomes "muscle_gain"
 * - null or undefined becomes an empty string
 *
 * @param {string} value - Incoming text from request body.
 * @returns {string} Clean lowercase text.
 */
const normalizeText = (value) => {
    return String(value || "").trim().toLowerCase();
};

/**
 * Randomly shuffles an array without changing the original array.
 *
 * Why this is needed:
 * - Without shuffling, the same body part would always return exercises in the same order.
 * - Shuffling makes each generated workout feel more personalized and less repetitive.
 *
 * @param {Array} array - Original array of exercises.
 * @returns {Array} New shuffled copy of the array.
 */
const shuffleArray = (array) => {
    const cloned = [...array];
    for (let i = cloned.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
    }
    return cloned;
};

/**
 * Decides how many main exercises should be included based on duration.
 *
 * Logic:
 * - 20 minutes or less: 4 exercises
 * - 21 to 30 minutes: 5 exercises
 * - 31 to 45 minutes: 6 exercises
 * - More than 45 minutes: 7 exercises
 *
 * Warm-up and cool-down are added separately, so the final exercise list will be
 * slightly longer than this count.
 *
 * @param {number} duration - Workout duration selected by the user.
 * @returns {number} Number of main exercises to include.
 */
const getExerciseCountByDuration = (duration) => {
    const safeDuration = Number(duration) || 30;

    if (safeDuration <= 20) return 4;
    if (safeDuration <= 30) return 5;
    if (safeDuration <= 45) return 6;
    return 7;
};

/**
 * Internal exercise database used by the workout generator.
 *
 * Each body part contains a list of exercises.
 * Each exercise has:
 * - name: exercise name shown to the user
 * - equipment: supported equipment options
 * - levels: supported fitness levels
 * - goals: supported goals
 * - sets: recommended sets based on level
 * - reps: recommended reps/time based on goal
 * - rest: recommended rest time based on goal
 *
 * This is currently stored directly in the controller.
 * For a larger production system, this could later be moved into MongoDB.
 */
/**
 * ============================================================
 * Exercise Details Helper
 * ============================================================
 *
 * This object stores the step-by-step instructions and form tips
 * for every exercise used in EXERCISE_LIBRARY.
 *
 * The exercise name must exactly match the name used in
 * EXERCISE_LIBRARY.
 */
const EXERCISE_DETAILS = {
    "Barbell Bench Press": {
        steps: [
            "Lie flat on a bench with your eyes directly under the barbell.",
            "Place your feet firmly on the floor and keep your shoulder blades pulled back.",
            "Grip the bar slightly wider than shoulder width.",
            "Unrack the bar carefully and hold it above your chest.",
            "Lower the bar slowly toward the middle of your chest.",
            "Press the bar upward until your arms are almost straight.",
            "Repeat the movement with controlled breathing and stable wrists.",
        ],
        tips: [
            "Do not bounce the bar off your chest.",
            "Keep your wrists straight throughout the lift.",
            "Use a spotter when lifting heavy weight.",
        ],
    },

    "Incline Dumbbell Press": {
        steps: [
            "Set the bench to a 30 to 45 degree incline.",
            "Sit on the bench with one dumbbell in each hand.",
            "Bring the dumbbells to shoulder level with your palms facing forward.",
            "Keep your back against the bench and feet flat on the floor.",
            "Press both dumbbells upward until your arms are almost straight.",
            "Slowly lower the dumbbells back toward your upper chest.",
            "Repeat with controlled movement.",
        ],
        tips: [
            "Do not over-arch your lower back.",
            "Avoid letting the dumbbells crash together at the top.",
            "Use a weight that you can control properly.",
        ],
    },

    "Decline Bench Press": {
        steps: [
            "Lie on a decline bench and secure your feet under the pads.",
            "Grip the bar slightly wider than shoulder width.",
            "Unrack the bar carefully and hold it above your lower chest.",
            "Lower the bar slowly toward your lower chest area.",
            "Press the bar upward using your chest and triceps.",
            "Keep your shoulders pulled back during the movement.",
            "Rack the bar safely after completing the set.",
        ],
        tips: [
            "Use a spotter if possible.",
            "Do not rush the movement because the decline angle can feel unstable.",
            "Keep your wrists straight and controlled.",
        ],
    },

    "Push Ups": {
        steps: [
            "Start in a high plank position with your hands slightly wider than shoulder width.",
            "Keep your body straight from head to heels.",
            "Tighten your core and glutes before lowering.",
            "Lower your chest toward the floor by bending your elbows.",
            "Pause briefly when your chest is close to the floor.",
            "Push through your palms to return to the starting position.",
            "Repeat with controlled breathing.",
        ],
        tips: [
            "Do not let your hips drop.",
            "Keep your neck neutral.",
            "Control both the lowering and pushing phase.",
        ],
    },

    "Chest Fly": {
        steps: [
            "Lie on a flat bench with one dumbbell in each hand.",
            "Hold the dumbbells above your chest with palms facing each other.",
            "Keep a slight bend in your elbows.",
            "Open your arms slowly out to the sides.",
            "Lower until you feel a gentle stretch in your chest.",
            "Bring the dumbbells back together by squeezing your chest.",
            "Repeat slowly without swinging the weights.",
        ],
        tips: [
            "Do not lower the dumbbells too far.",
            "Keep your elbows slightly bent.",
            "Focus on chest contraction instead of heavy weight.",
        ],
    },

    "Cable Fly": {
        steps: [
            "Stand between the cable machines and hold one handle in each hand.",
            "Step forward slightly to create tension in the cables.",
            "Keep your chest lifted and your elbows slightly bent.",
            "Bring both handles together in front of your chest.",
            "Squeeze your chest briefly at the center.",
            "Slowly return your arms to the starting position.",
            "Repeat with controlled movement.",
        ],
        tips: [
            "Do not let the cables pull your arms back too quickly.",
            "Avoid locking your elbows.",
            "Keep your body stable throughout the movement.",
        ],
    },

    "Dips": {
        steps: [
            "Hold the parallel bars firmly with both hands.",
            "Lift your body so your arms support your weight.",
            "Lean slightly forward to target the chest more.",
            "Lower your body by bending your elbows.",
            "Stop when your upper arms are close to parallel with the floor.",
            "Push yourself back up using your chest and triceps.",
            "Repeat while keeping your body stable.",
        ],
        tips: [
            "Do not drop too low if your shoulders feel uncomfortable.",
            "Avoid swinging your legs.",
            "Keep your elbows controlled.",
        ],
    },

    "Machine Chest Press": {
        steps: [
            "Adjust the seat so the handles are level with your chest.",
            "Sit with your back flat against the pad.",
            "Hold the handles firmly with both hands.",
            "Push the handles forward until your arms are almost straight.",
            "Pause briefly at the front.",
            "Slowly return the handles to the starting position.",
            "Repeat with steady control.",
        ],
        tips: [
            "Do not lock your elbows forcefully.",
            "Keep your shoulders relaxed.",
            "Control the weight on the way back.",
        ],
    },

    "Lat Pulldown": {
        steps: [
            "Sit on the lat pulldown machine and adjust the thigh pad.",
            "Hold the bar with a grip wider than shoulder width.",
            "Keep your chest lifted and your back straight.",
            "Pull the bar down toward your upper chest.",
            "Squeeze your shoulder blades together at the bottom.",
            "Slowly return the bar upward with control.",
            "Repeat without leaning too far back.",
        ],
        tips: [
            "Do not pull the bar behind your neck.",
            "Avoid using momentum.",
            "Focus on pulling with your back instead of only your arms.",
        ],
    },

    "Pull Ups": {
        steps: [
            "Hold the pull-up bar with your palms facing away from you.",
            "Hang with your arms fully extended.",
            "Tighten your core and keep your body still.",
            "Pull your chest toward the bar.",
            "Squeeze your back muscles at the top.",
            "Lower yourself slowly back to the hanging position.",
            "Repeat without swinging.",
        ],
        tips: [
            "Avoid kicking your legs for momentum.",
            "Use assisted support if needed.",
            "Control the lowering phase.",
        ],
    },

    "Seated Cable Row": {
        steps: [
            "Sit on the cable row machine with your feet on the platform.",
            "Hold the handle with both hands.",
            "Sit upright with your chest lifted.",
            "Pull the handle toward your lower stomach.",
            "Squeeze your shoulder blades together.",
            "Slowly extend your arms back to the starting position.",
            "Repeat while keeping your back straight.",
        ],
        tips: [
            "Do not round your lower back.",
            "Pull with your elbows, not only your hands.",
            "Keep your shoulders down and controlled.",
        ],
    },

    "One Arm Dumbbell Row": {
        steps: [
            "Place one hand and one knee on a bench for support.",
            "Hold a dumbbell in the opposite hand.",
            "Keep your back flat and your core tight.",
            "Pull the dumbbell toward your waist.",
            "Squeeze your back at the top.",
            "Lower the dumbbell slowly until your arm is extended.",
            "Complete all reps on one side before switching.",
        ],
        tips: [
            "Do not twist your body while pulling.",
            "Keep your elbow close to your body.",
            "Control the lowering phase.",
        ],
    },

    "Deadlift": {
        steps: [
            "Stand with your feet hip-width apart and the bar over your mid-foot.",
            "Bend at your hips and knees to grip the bar.",
            "Keep your back flat, chest lifted, and core braced.",
            "Push through your feet and lift the bar by extending your hips and knees.",
            "Stand tall at the top without leaning backward.",
            "Lower the bar with control while keeping it close to your body.",
            "Reset your position before the next rep.",
        ],
        tips: [
            "Do not round your back.",
            "Keep the bar close to your legs.",
            "Start with light weight until your form is correct.",
        ],
    },

    "T-Bar Row": {
        steps: [
            "Stand over the T-bar row setup and grip the handles.",
            "Bend slightly at your hips while keeping your back straight.",
            "Keep your chest up and core tight.",
            "Pull the handles toward your lower chest.",
            "Squeeze your shoulder blades together.",
            "Lower the weight slowly until your arms extend.",
            "Repeat with stable posture.",
        ],
        tips: [
            "Do not jerk the weight upward.",
            "Avoid rounding your shoulders.",
            "Keep your core tight.",
        ],
    },

    "Face Pull": {
        steps: [
            "Set the cable pulley around face height and attach a rope.",
            "Hold the rope with both hands and step back.",
            "Keep your chest lifted and your elbows high.",
            "Pull the rope toward your face.",
            "Separate your hands slightly as you pull.",
            "Squeeze your rear shoulders and upper back.",
            "Return slowly to the starting position.",
        ],
        tips: [
            "Use light to moderate weight.",
            "Do not lean backward too much.",
            "Focus on rear shoulders and upper back.",
        ],
    },

    "Inverted Row": {
        steps: [
            "Set a bar around waist height.",
            "Lie underneath the bar and hold it with both hands.",
            "Keep your body straight from head to heels.",
            "Pull your chest toward the bar.",
            "Squeeze your shoulder blades together.",
            "Lower yourself slowly back down.",
            "Repeat while keeping your body straight.",
        ],
        tips: [
            "Do not let your hips drop.",
            "Move your feet closer to make it easier.",
            "Keep your core tight.",
        ],
    },

    "Barbell Squat": {
        steps: [
            "Place the barbell across your upper back, not your neck.",
            "Stand with your feet slightly wider than shoulder width.",
            "Brace your core and keep your chest lifted.",
            "Bend your knees and hips to lower your body.",
            "Lower until your thighs are close to parallel if comfortable.",
            "Push through your heels to stand back up.",
            "Repeat while keeping your knees aligned with your toes.",
        ],
        tips: [
            "Do not let your knees collapse inward.",
            "Keep your back neutral.",
            "Use a controlled depth that feels safe.",
        ],
    },

    "Leg Press": {
        steps: [
            "Sit on the leg press machine with your back against the pad.",
            "Place your feet shoulder-width apart on the platform.",
            "Unlock the safety handles carefully.",
            "Lower the platform by bending your knees.",
            "Stop when your knees are around 90 degrees.",
            "Push the platform back up through your heels.",
            "Repeat without locking your knees hard.",
        ],
        tips: [
            "Do not lift your lower back off the seat.",
            "Keep your knees in line with your toes.",
            "Control the lowering phase.",
        ],
    },

    "Walking Lunges": {
        steps: [
            "Stand tall with your feet hip-width apart.",
            "Step forward with one leg.",
            "Lower your body until both knees are bent.",
            "Push through your front heel to move forward.",
            "Bring your back leg forward into the next lunge.",
            "Continue alternating legs.",
            "Keep your chest lifted throughout.",
        ],
        tips: [
            "Do not let your front knee collapse inward.",
            "Keep your steps controlled.",
            "Start with bodyweight before adding dumbbells.",
        ],
    },

    "Romanian Deadlift": {
        steps: [
            "Stand tall while holding a barbell or dumbbells in front of your thighs.",
            "Keep your knees slightly bent.",
            "Push your hips backward while lowering the weight.",
            "Keep the weight close to your legs.",
            "Lower until you feel a stretch in your hamstrings.",
            "Drive your hips forward to return to standing.",
            "Repeat with a flat back.",
        ],
        tips: [
            "Do not round your back.",
            "This movement comes mainly from the hips.",
            "Do not bend your knees like a squat.",
        ],
    },

    "Bulgarian Split Squat": {
        steps: [
            "Stand in front of a bench with your back facing it.",
            "Place one foot behind you on the bench.",
            "Keep your front foot firmly on the ground.",
            "Lower your body by bending your front knee.",
            "Go down until your front thigh is close to parallel.",
            "Push through your front heel to stand back up.",
            "Complete all reps on one leg before switching.",
        ],
        tips: [
            "Keep your front knee stable.",
            "Use bodyweight first if balance is difficult.",
            "Do not lean too far forward.",
        ],
    },

    "Hamstring Curl": {
        steps: [
            "Adjust the hamstring curl machine to fit your body.",
            "Position your legs under the padded lever.",
            "Hold the handles for support.",
            "Curl your heels toward your glutes.",
            "Squeeze your hamstrings at the top.",
            "Slowly lower the weight back down.",
            "Repeat with controlled movement.",
        ],
        tips: [
            "Do not lift your hips off the pad.",
            "Avoid using momentum.",
            "Control the weight on the way down.",
        ],
    },

    "Leg Extension": {
        steps: [
            "Sit on the leg extension machine and adjust the pad above your ankles.",
            "Hold the side handles for support.",
            "Keep your back against the seat.",
            "Extend your legs until they are almost straight.",
            "Squeeze your quadriceps at the top.",
            "Slowly lower the weight back down.",
            "Repeat without swinging.",
        ],
        tips: [
            "Do not lock your knees hard.",
            "Use controlled movement.",
            "Avoid lifting your hips from the seat.",
        ],
    },

    "Calf Raises": {
        steps: [
            "Stand with your feet about hip-width apart.",
            "Keep your body upright and core tight.",
            "Raise your heels off the floor as high as possible.",
            "Squeeze your calves at the top.",
            "Lower your heels slowly back down.",
            "Repeat for the required reps.",
            "Use support for balance if needed.",
        ],
        tips: [
            "Do not bounce quickly.",
            "Use full range of motion.",
            "Pause briefly at the top.",
        ],
    },

    "Shoulder Press": {
        steps: [
            "Sit or stand with dumbbells or a barbell at shoulder level.",
            "Keep your core tight and chest lifted.",
            "Press the weight overhead until your arms are almost straight.",
            "Pause briefly at the top.",
            "Lower the weight slowly back to shoulder level.",
            "Keep your elbows controlled.",
            "Repeat with steady breathing.",
        ],
        tips: [
            "Do not arch your lower back excessively.",
            "Avoid locking your elbows hard.",
            "Use a weight you can control.",
        ],
    },

    "Arnold Press": {
        steps: [
            "Sit or stand while holding dumbbells in front of your shoulders.",
            "Start with your palms facing your body.",
            "Rotate your palms outward as you press the dumbbells overhead.",
            "Finish with your palms facing forward at the top.",
            "Lower the dumbbells while rotating back to the starting position.",
            "Keep your core tight throughout.",
            "Repeat slowly and smoothly.",
        ],
        tips: [
            "Do not rush the rotation.",
            "Use lighter weight than a regular shoulder press.",
            "Keep your back stable.",
        ],
    },

    "Lateral Raise": {
        steps: [
            "Stand with a dumbbell in each hand by your sides.",
            "Keep a slight bend in your elbows.",
            "Raise both arms out to the sides.",
            "Stop when your hands reach shoulder height.",
            "Pause briefly at the top.",
            "Lower the dumbbells slowly.",
            "Repeat without swinging.",
        ],
        tips: [
            "Do not shrug your shoulders.",
            "Use light weight.",
            "Control the movement both up and down.",
        ],
    },

    "Front Raise": {
        steps: [
            "Stand with dumbbells or a plate in front of your thighs.",
            "Keep your core tight and back straight.",
            "Raise the weight in front of your body.",
            "Stop when the weight reaches shoulder height.",
            "Pause briefly at the top.",
            "Lower the weight slowly.",
            "Repeat with controlled form.",
        ],
        tips: [
            "Do not swing your body.",
            "Keep your shoulders relaxed.",
            "Use moderate or light weight.",
        ],
    },

    "Rear Delt Fly": {
        steps: [
            "Hold dumbbells and bend slightly forward at your hips.",
            "Keep your back flat and knees slightly bent.",
            "Let the dumbbells hang below your chest.",
            "Raise your arms out to the sides.",
            "Squeeze your rear shoulders at the top.",
            "Lower the dumbbells slowly.",
            "Repeat without using momentum.",
        ],
        tips: [
            "Keep the weight light.",
            "Do not round your back.",
            "Focus on rear shoulder contraction.",
        ],
    },

    "Upright Row": {
        steps: [
            "Stand holding a barbell or dumbbells in front of your thighs.",
            "Keep the weight close to your body.",
            "Pull the weight upward toward your upper chest.",
            "Lead the movement with your elbows.",
            "Pause briefly at the top.",
            "Lower the weight slowly.",
            "Repeat with control.",
        ],
        tips: [
            "Do not pull too high if your shoulders feel discomfort.",
            "Avoid jerking the weight upward.",
            "Keep your core tight.",
        ],
    },

    "Machine Shoulder Press": {
        steps: [
            "Adjust the seat so the handles are near shoulder level.",
            "Sit with your back against the pad.",
            "Grip the handles firmly.",
            "Press the handles upward until your arms are almost straight.",
            "Pause briefly at the top.",
            "Lower the handles slowly.",
            "Repeat with controlled movement.",
        ],
        tips: [
            "Do not lock your elbows forcefully.",
            "Keep your shoulders relaxed.",
            "Control the machine on the way down.",
        ],
    },

    "Barbell Curl": {
        steps: [
            "Stand tall while holding a barbell with palms facing forward.",
            "Keep your elbows close to your body.",
            "Curl the bar upward toward your chest.",
            "Squeeze your biceps at the top.",
            "Lower the bar slowly back down.",
            "Keep your upper arms still.",
            "Repeat without swinging.",
        ],
        tips: [
            "Do not use your back to lift the weight.",
            "Keep your wrists straight.",
            "Control the lowering phase.",
        ],
    },

    "Hammer Curl": {
        steps: [
            "Stand with one dumbbell in each hand.",
            "Keep your palms facing each other.",
            "Keep your elbows close to your sides.",
            "Curl the dumbbells upward toward your shoulders.",
            "Squeeze your arms at the top.",
            "Lower the dumbbells slowly.",
            "Repeat with controlled form.",
        ],
        tips: [
            "Do not swing your arms.",
            "Keep your elbows fixed.",
            "Use a full range of motion.",
        ],
    },

    "Concentration Curl": {
        steps: [
            "Sit on a bench with your legs apart.",
            "Hold one dumbbell in one hand.",
            "Rest your elbow against the inside of your thigh.",
            "Curl the dumbbell upward toward your shoulder.",
            "Squeeze your biceps at the top.",
            "Lower the dumbbell slowly.",
            "Complete all reps before switching arms.",
        ],
        tips: [
            "Do not move your upper arm.",
            "Use lighter weight for better form.",
            "Focus on slow control.",
        ],
    },

    "EZ Bar Curl": {
        steps: [
            "Stand holding an EZ bar with an underhand grip.",
            "Keep your elbows close to your body.",
            "Curl the bar upward toward your chest.",
            "Pause briefly at the top.",
            "Lower the bar slowly.",
            "Keep your torso still.",
            "Repeat without swinging.",
        ],
        tips: [
            "Do not lean backward.",
            "Keep your wrists comfortable on the angled grip.",
            "Control the weight down.",
        ],
    },

    "Tricep Pushdown": {
        steps: [
            "Stand in front of a cable machine with the pulley set high.",
            "Hold the bar or rope attachment with both hands.",
            "Keep your elbows close to your sides.",
            "Push the handle downward until your arms are straight.",
            "Squeeze your triceps at the bottom.",
            "Slowly return to the starting position.",
            "Repeat without moving your elbows forward.",
        ],
        tips: [
            "Do not use your body weight to push down.",
            "Keep your shoulders relaxed.",
            "Control the handle on the way up.",
        ],
    },

    "Overhead Tricep Extension": {
        steps: [
            "Hold a dumbbell or cable attachment above your head.",
            "Keep your elbows pointing forward.",
            "Lower the weight behind your head by bending your elbows.",
            "Feel a stretch in your triceps.",
            "Extend your arms to lift the weight back up.",
            "Squeeze your triceps at the top.",
            "Repeat slowly.",
        ],
        tips: [
            "Do not flare your elbows too wide.",
            "Keep your core tight.",
            "Use a controlled weight.",
        ],
    },

    "Bench Dips": {
        steps: [
            "Sit on the edge of a bench and place your hands beside your hips.",
            "Move your hips off the bench.",
            "Keep your feet on the floor in front of you.",
            "Lower your body by bending your elbows.",
            "Stop when your elbows are around 90 degrees.",
            "Push through your hands to return upward.",
            "Repeat with controlled movement.",
        ],
        tips: [
            "Do not drop too low if your shoulders feel pain.",
            "Keep your elbows pointing backward.",
            "Bend your knees to make it easier.",
        ],
    },

    "Skull Crushers": {
        steps: [
            "Lie on a bench while holding a barbell or dumbbells above your chest.",
            "Keep your upper arms still.",
            "Bend your elbows to lower the weight toward your forehead.",
            "Pause before the weight gets too close.",
            "Extend your elbows to lift the weight back up.",
            "Squeeze your triceps at the top.",
            "Repeat with slow control.",
        ],
        tips: [
            "Do not move your shoulders too much.",
            "Use light to moderate weight.",
            "Keep your wrists stable.",
        ],
    },

    "Crunches": {
        steps: [
            "Lie on your back with your knees bent.",
            "Place your hands lightly behind your head or across your chest.",
            "Tighten your abdominal muscles.",
            "Lift your upper back slightly off the floor.",
            "Squeeze your abs at the top.",
            "Lower yourself slowly.",
            "Repeat without pulling your neck.",
        ],
        tips: [
            "Do not pull your neck forward.",
            "Keep your lower back on the floor.",
            "Focus on abdominal contraction.",
        ],
    },

    "Leg Raises": {
        steps: [
            "Lie flat on your back with your legs straight.",
            "Place your hands beside your body or under your hips.",
            "Tighten your core.",
            "Raise your legs upward until they are nearly vertical.",
            "Lower your legs slowly toward the floor.",
            "Stop before your lower back lifts.",
            "Repeat with control.",
        ],
        tips: [
            "Do not swing your legs.",
            "Keep your lower back controlled.",
            "Bend your knees slightly if it feels too hard.",
        ],
    },

    "Plank": {
        steps: [
            "Place your forearms on the floor.",
            "Extend your legs behind you.",
            "Keep your body straight from head to heels.",
            "Tighten your core and glutes.",
            "Hold the position for the required time.",
            "Breathe steadily while holding.",
            "Rest after completing the set.",
        ],
        tips: [
            "Do not let your hips drop.",
            "Do not raise your hips too high.",
            "Keep your neck neutral.",
        ],
    },

    "Russian Twists": {
        steps: [
            "Sit on the floor with your knees bent.",
            "Lean back slightly while keeping your back straight.",
            "Hold your hands together or hold a light dumbbell.",
            "Rotate your torso to one side.",
            "Return through the center and rotate to the other side.",
            "Continue alternating sides.",
            "Keep your core engaged throughout.",
        ],
        tips: [
            "Rotate your torso, not only your arms.",
            "Keep your back straight.",
            "Move slowly for better control.",
        ],
    },

    "Mountain Climbers": {
        steps: [
            "Start in a high plank position.",
            "Keep your hands under your shoulders.",
            "Tighten your core.",
            "Drive one knee toward your chest.",
            "Return that leg back and switch sides.",
            "Continue alternating legs at a steady pace.",
            "Keep your hips stable while moving.",
        ],
        tips: [
            "Do not let your hips bounce too much.",
            "Keep your shoulders over your hands.",
            "Move slower for control or faster for cardio.",
        ],
    },

    "Bicycle Crunch": {
        steps: [
            "Lie on your back with your hands lightly behind your head.",
            "Lift your legs off the floor.",
            "Bring one knee toward your chest.",
            "Rotate your opposite elbow toward that knee.",
            "Switch sides in a cycling motion.",
            "Continue alternating left and right.",
            "Keep your core tight throughout.",
        ],
        tips: [
            "Do not pull your neck.",
            "Rotate your torso, not just your elbows.",
            "Move with control instead of speed.",
        ],
    },

    "Hanging Knee Raise": {
        steps: [
            "Hang from a pull-up bar with both hands.",
            "Keep your shoulders stable.",
            "Tighten your core.",
            "Raise your knees toward your chest.",
            "Pause briefly at the top.",
            "Lower your legs slowly.",
            "Repeat without swinging.",
        ],
        tips: [
            "Avoid using momentum.",
            "Keep your core engaged.",
            "Start with bent knees before trying straight leg raises.",
        ],
    },

    "Squats": {
        steps: [
            "Stand with your feet slightly wider than shoulder width.",
            "Keep your chest lifted and core tight.",
            "Push your hips back slightly.",
            "Bend your knees and lower your body.",
            "Lower until your thighs are close to parallel with the floor.",
            "Push through your heels to stand back up.",
            "Repeat with steady control.",
        ],
        tips: [
            "Keep your knees aligned with your toes.",
            "Do not round your back.",
            "Control both the lowering and standing phase.",
        ],
    },

    "Dumbbell Row": {
        steps: [
            "Hold a dumbbell in each hand or one dumbbell at a time.",
            "Bend slightly at your hips while keeping your back flat.",
            "Let the dumbbells hang below your shoulders.",
            "Pull the dumbbells toward your waist.",
            "Squeeze your back at the top.",
            "Lower the dumbbells slowly.",
            "Repeat with controlled form.",
        ],
        tips: [
            "Do not round your back.",
            "Avoid shrugging your shoulders.",
            "Pull with your elbows, not only your hands.",
        ],
    },
};

/**
 * Helper function to attach steps and tips to each exercise.
 */
const addExerciseDetails = (exercise) => {
    const details = EXERCISE_DETAILS[exercise.name];

    return {
        ...exercise,
        steps: details?.steps || [
            `Prepare your body and equipment for ${exercise.name}.`,
            "Start from a safe and stable position.",
            "Perform the movement slowly with controlled form.",
            "Keep your breathing steady and posture correct.",
            "Stop immediately if you feel sharp pain or discomfort.",
        ],
        tips: details?.tips || [
            "Use a weight or intensity that matches your current fitness level.",
            "Do not rush the movement.",
            "Focus on correct technique before increasing difficulty.",
        ],
    };
};

/**
 * ============================================================
 * Exercise Library With Steps and Tips
 * ============================================================
 */
const EXERCISE_LIBRARY = {
    chest: [
        {
            name: "Barbell Bench Press",
            equipment: ["barbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "strength", "general_fitness"],
            sets: { beginner: 3, intermediate: 4, advanced: 5 },
            reps: {
                muscle_gain: "8-12",
                strength: "4-6",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "90 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Incline Dumbbell Press",
            equipment: ["dumbbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness", "fat_loss"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "6-8",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "75 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Decline Bench Press",
            equipment: ["barbell", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "strength"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "8-10",
                strength: "4-6",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "90 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Push Ups",
            equipment: ["bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["fat_loss", "general_fitness", "muscle_gain"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "12-15",
                strength: "10-12",
                fat_loss: "15-20",
                general_fitness: "12-15",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Chest Fly",
            equipment: ["dumbbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "8-10",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Cable Fly",
            equipment: ["machine", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "fat_loss", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "8-10",
                fat_loss: "15-20",
                general_fitness: "12-15",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Dips",
            equipment: ["bodyweight", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "strength", "fat_loss"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "6-8",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "90 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Machine Chest Press",
            equipment: ["machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness", "fat_loss"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "6-8",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "75 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
    ].map(addExerciseDetails),

    back: [
        {
            name: "Lat Pulldown",
            equipment: ["machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness", "fat_loss"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "6-8",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "75 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Pull Ups",
            equipment: ["bodyweight", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["strength", "muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 4, advanced: 5 },
            reps: {
                muscle_gain: "8-10",
                strength: "5-8",
                fat_loss: "10-12",
                general_fitness: "8-10",
            },
            rest: {
                muscle_gain: "75 sec",
                strength: "90 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Seated Cable Row",
            equipment: ["machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "6-8",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "75 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "One Arm Dumbbell Row",
            equipment: ["dumbbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness", "fat_loss"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "6-8",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Deadlift",
            equipment: ["barbell", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["strength", "muscle_gain"],
            sets: { beginner: 3, intermediate: 4, advanced: 5 },
            reps: {
                muscle_gain: "6-8",
                strength: "3-5",
                fat_loss: "10-12",
                general_fitness: "8-10",
            },
            rest: {
                muscle_gain: "90 sec",
                strength: "120 sec",
                fat_loss: "60 sec",
                general_fitness: "75 sec",
            },
        },
        {
            name: "T-Bar Row",
            equipment: ["barbell", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "strength"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "8-10",
                strength: "5-6",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "75 sec",
                strength: "90 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Face Pull",
            equipment: ["machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["general_fitness", "fat_loss", "muscle_gain"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "12-15",
                strength: "10-12",
                fat_loss: "15-20",
                general_fitness: "12-15",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Inverted Row",
            equipment: ["bodyweight", "gym"],
            levels: ["beginner", "intermediate"],
            goals: ["general_fitness", "fat_loss", "muscle_gain"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "8-10",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
    ].map(addExerciseDetails),

    legs: [
        {
            name: "Barbell Squat",
            equipment: ["barbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["strength", "muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 4, advanced: 5 },
            reps: {
                muscle_gain: "8-12",
                strength: "4-6",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "75 sec",
                strength: "120 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Leg Press",
            equipment: ["machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness", "fat_loss"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "6-8",
                fat_loss: "15-20",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "75 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Walking Lunges",
            equipment: ["dumbbell", "bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["fat_loss", "general_fitness", "muscle_gain"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10 each leg",
                strength: "8 each leg",
                fat_loss: "12 each leg",
                general_fitness: "10 each leg",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Romanian Deadlift",
            equipment: ["barbell", "dumbbell", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "strength"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "8-10",
                strength: "5-6",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "75 sec",
                strength: "90 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Bulgarian Split Squat",
            equipment: ["dumbbell", "bodyweight", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "fat_loss", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10 each leg",
                strength: "8 each leg",
                fat_loss: "12 each leg",
                general_fitness: "10 each leg",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Hamstring Curl",
            equipment: ["machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "8-10",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Leg Extension",
            equipment: ["machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "fat_loss", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "12-15",
                strength: "10-12",
                fat_loss: "15-20",
                general_fitness: "12-15",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Calf Raises",
            equipment: ["machine", "bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["general_fitness", "fat_loss", "muscle_gain"],
            sets: { beginner: 4, intermediate: 4, advanced: 5 },
            reps: {
                muscle_gain: "15-20",
                strength: "12-15",
                fat_loss: "20-25",
                general_fitness: "15-20",
            },
            rest: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "20 sec",
                general_fitness: "30 sec",
            },
        },
    ].map(addExerciseDetails),

    shoulders: [
        {
            name: "Shoulder Press",
            equipment: ["dumbbell", "barbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "strength", "general_fitness"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "5-6",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "90 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Arnold Press",
            equipment: ["dumbbell", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "6-8",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "75 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Lateral Raise",
            equipment: ["dumbbell", "machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "fat_loss", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "12-15",
                strength: "10-12",
                fat_loss: "15-20",
                general_fitness: "12-15",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Front Raise",
            equipment: ["dumbbell", "plate", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "12-15",
                strength: "10-12",
                fat_loss: "15-20",
                general_fitness: "12-15",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Rear Delt Fly",
            equipment: ["dumbbell", "machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness", "fat_loss"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "12-15",
                strength: "10-12",
                fat_loss: "15-20",
                general_fitness: "12-15",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Upright Row",
            equipment: ["barbell", "dumbbell", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "strength"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "5-6",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "75 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Machine Shoulder Press",
            equipment: ["machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "6-8",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "75 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
    ].map(addExerciseDetails),

    arms: [
        {
            name: "Barbell Curl",
            equipment: ["barbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness", "strength"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "6-8",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Hammer Curl",
            equipment: ["dumbbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "8-10",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Concentration Curl",
            equipment: ["dumbbell", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "8-10",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "EZ Bar Curl",
            equipment: ["barbell", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "strength"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "6-8",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Tricep Pushdown",
            equipment: ["machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "fat_loss", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "8-10",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Overhead Tricep Extension",
            equipment: ["dumbbell", "machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "8-10",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Bench Dips",
            equipment: ["bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["fat_loss", "general_fitness", "muscle_gain"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "8-10",
                fat_loss: "15-20",
                general_fitness: "12-15",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Skull Crushers",
            equipment: ["barbell", "dumbbell", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "strength"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "6-8",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
    ].map(addExerciseDetails),

    core: [
        {
            name: "Crunches",
            equipment: ["bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["fat_loss", "general_fitness", "muscle_gain"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "20",
                strength: "15",
                fat_loss: "25",
                general_fitness: "20",
            },
            rest: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "20 sec",
                general_fitness: "30 sec",
            },
        },
        {
            name: "Leg Raises",
            equipment: ["bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["fat_loss", "general_fitness", "muscle_gain"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "15",
                strength: "12",
                fat_loss: "20",
                general_fitness: "15",
            },
            rest: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "20 sec",
                general_fitness: "30 sec",
            },
        },
        {
            name: "Plank",
            equipment: ["bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["general_fitness", "fat_loss", "strength"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "60 sec",
                general_fitness: "45 sec",
            },
            rest: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "20 sec",
                general_fitness: "30 sec",
            },
        },
        {
            name: "Russian Twists",
            equipment: ["bodyweight", "dumbbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["fat_loss", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "20",
                strength: "16",
                fat_loss: "24",
                general_fitness: "20",
            },
            rest: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "20 sec",
                general_fitness: "30 sec",
            },
        },
        {
            name: "Mountain Climbers",
            equipment: ["bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["fat_loss", "general_fitness"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "30 sec",
                strength: "20 sec",
                fat_loss: "40 sec",
                general_fitness: "30 sec",
            },
            rest: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "20 sec",
                general_fitness: "30 sec",
            },
        },
        {
            name: "Bicycle Crunch",
            equipment: ["bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["fat_loss", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "20",
                strength: "16",
                fat_loss: "30",
                general_fitness: "20",
            },
            rest: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "20 sec",
                general_fitness: "30 sec",
            },
        },
        {
            name: "Hanging Knee Raise",
            equipment: ["bodyweight", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness", "fat_loss"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "12-15",
                strength: "10-12",
                fat_loss: "15-20",
                general_fitness: "12-15",
            },
            rest: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "20 sec",
                general_fitness: "30 sec",
            },
        },
    ].map(addExerciseDetails),

    full_body: [
        {
            name: "Squats",
            equipment: ["bodyweight", "barbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["general_fitness", "fat_loss", "muscle_gain", "strength"],
            sets: { beginner: 3, intermediate: 4, advanced: 5 },
            reps: {
                muscle_gain: "10-12",
                strength: "4-6",
                fat_loss: "15-20",
                general_fitness: "12-15",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "90 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Push Ups",
            equipment: ["bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["general_fitness", "fat_loss", "muscle_gain"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "12-15",
                strength: "10-12",
                fat_loss: "15-20",
                general_fitness: "12-15",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Pull Ups",
            equipment: ["bodyweight", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["strength", "muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "8-10",
                strength: "5-8",
                fat_loss: "10-12",
                general_fitness: "8-10",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "90 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Dumbbell Row",
            equipment: ["dumbbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["general_fitness", "muscle_gain", "fat_loss"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "8-10",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Shoulder Press",
            equipment: ["dumbbell", "barbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["general_fitness", "muscle_gain", "strength"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "5-6",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "90 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Deadlift",
            equipment: ["barbell", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["strength", "muscle_gain"],
            sets: { beginner: 3, intermediate: 4, advanced: 5 },
            reps: {
                muscle_gain: "6-8",
                strength: "3-5",
                fat_loss: "10-12",
                general_fitness: "8-10",
            },
            rest: {
                muscle_gain: "90 sec",
                strength: "120 sec",
                fat_loss: "60 sec",
                general_fitness: "75 sec",
            },
        },
        {
            name: "Mountain Climbers",
            equipment: ["bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["fat_loss", "general_fitness"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "30 sec",
                strength: "20 sec",
                fat_loss: "40 sec",
                general_fitness: "30 sec",
            },
            rest: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "20 sec",
                general_fitness: "30 sec",
            },
        },
        {
            name: "Plank",
            equipment: ["bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["general_fitness", "fat_loss", "strength"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "60 sec",
                general_fitness: "45 sec",
            },
            rest: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "20 sec",
                general_fitness: "30 sec",
            },
        },
    ].map(addExerciseDetails),
};
const getFilteredExercises = ({
    bodyPart,
    level,
    goal,
    equipment,
}) => {
    const exercisePool = EXERCISE_LIBRARY[bodyPart] || EXERCISE_LIBRARY.full_body;

    let filtered = exercisePool.filter((exercise) =>
        exercise.levels.includes(level)
    );

    filtered = filtered.filter((exercise) =>
        exercise.goals.includes(goal)
    );

    if (equipment && equipment !== "gym") {
        filtered = filtered.filter((exercise) =>
            exercise.equipment.includes(equipment)
        );
    }

    if (!filtered.length) {
        filtered = exercisePool.filter((exercise) =>
            exercise.levels.includes(level)
        );
    }

    if (!filtered.length) {
        filtered = exercisePool;
    }

    return filtered;
};

/**
 * Builds a warm-up block based on the workout goal and duration.
 *
 * This version includes:
 * - name
 * - sets
 * - reps
 * - rest
 * - steps
 * - tips
 */
const buildWarmUp = (goal, duration) => {
    const safeDuration = Number(duration) || 30;

    if (goal === "strength") {
        return {
            name: "Warm Up",
            sets: 1,
            reps:
                safeDuration >= 45
                    ? "8 min treadmill walk + dynamic mobility + light warm-up sets"
                    : "5 min treadmill walk + mobility + light warm-up sets",
            rest: "-",
            steps: [
                "Start with light walking or cycling to slowly raise your body temperature.",
                "Move your shoulders, hips, knees, and ankles through gentle mobility movements.",
                "Perform dynamic movements such as arm circles, leg swings, hip openers, and bodyweight squats.",
                "Before heavy lifts, complete one or two lighter warm-up sets of the main exercise.",
                "Gradually increase intensity instead of starting with heavy weight immediately.",
            ],
            tips: [
                "Do not skip warm-up before strength training.",
                "Keep the warm-up controlled and comfortable.",
                "The goal is to prepare your joints and muscles, not to make yourself tired.",
            ],
        };
    }

    if (goal === "fat_loss") {
        return {
            name: "Warm Up",
            sets: 1,
            reps:
                safeDuration >= 45
                    ? "8 min brisk cardio + active mobility"
                    : "5 min brisk cardio + dynamic mobility",
            rest: "-",
            steps: [
                "Begin with brisk walking, cycling, or light jogging.",
                "Gradually increase your pace until your breathing becomes slightly faster.",
                "Add dynamic mobility movements such as arm swings, leg swings, and bodyweight squats.",
                "Keep moving continuously to prepare your body for a higher heart-rate workout.",
                "Start the main workout only when your body feels warm and ready.",
            ],
            tips: [
                "Do not start with maximum speed immediately.",
                "Warm up enough to feel ready, not exhausted.",
                "Keep your breathing steady and controlled.",
            ],
        };
    }

    return {
        name: "Warm Up",
        sets: 1,
        reps:
            safeDuration >= 45
                ? "8 min light cardio + joint mobility"
                : "5 min light cardio + mobility",
        rest: "-",
        steps: [
            "Start with light cardio such as walking, cycling, or slow jogging.",
            "Move your major joints through gentle mobility exercises.",
            "Perform simple movements such as bodyweight squats, arm circles, and shoulder rolls.",
            "Gradually increase movement speed while staying comfortable.",
            "Begin the main workout when your muscles feel warm and loose.",
        ],
        tips: [
            "Do not rush into the workout without warming up.",
            "Keep the warm-up light and smooth.",
            "Focus on breathing, posture, and comfortable movement.",
        ],
    };
};

/**
 * Builds a cool-down block based on the workout goal.
 *
 * This version includes:
 * - name
 * - sets
 * - reps
 * - rest
 * - steps
 * - tips
 */
const buildCoolDown = (goal) => {
    if (goal === "strength") {
        return {
            name: "Cool Down",
            sets: 1,
            reps: "5-8 min walking + lower intensity stretching",
            rest: "-",
            steps: [
                "Walk slowly for a few minutes to bring your heart rate down.",
                "Stretch the main muscles used during the workout.",
                "Hold each stretch gently for around 15 to 30 seconds.",
                "Focus on slow breathing while stretching.",
                "Finish when your breathing feels calm and your body feels relaxed.",
            ],
            tips: [
                "Do not force painful stretches.",
                "Avoid bouncing during stretches.",
                "Use the cool-down to reduce stiffness after strength training.",
            ],
        };
    }

    if (goal === "fat_loss") {
        return {
            name: "Cool Down",
            sets: 1,
            reps: "5 min walking + recovery breathing + stretches",
            rest: "-",
            steps: [
                "Slow down gradually instead of stopping suddenly.",
                "Walk slowly until your breathing becomes more comfortable.",
                "Stretch your legs, hips, shoulders, and back.",
                "Take deep controlled breaths to help recovery.",
                "Drink water after finishing the session.",
            ],
            tips: [
                "Do not sit down immediately after intense movement.",
                "Keep the cool-down easy and relaxed.",
                "Focus on lowering your heart rate safely.",
            ],
        };
    }

    return {
        name: "Cool Down",
        sets: 1,
        reps: "5 min stretching and mobility recovery",
        rest: "-",
        steps: [
            "Move lightly for one to two minutes after the final exercise.",
            "Stretch the muscles used in the workout.",
            "Hold each stretch gently without bouncing.",
            "Breathe slowly and relax your body.",
            "Finish when your body feels calm and recovered.",
        ],
        tips: [
            "Do not skip the cool-down.",
            "Avoid painful stretching.",
            "Use this time to support flexibility and recovery.",
        ],
    };
};

/**
 * Creates a human-readable recommendation note for the generated workout.
 */
const buildRecommendationNote = ({
    goal,
    level,
    bodyPart,
    equipment,
}) => {
    if (goal === "fat_loss") {
        return `This ${bodyPart.replace("_", " ")} session is designed to keep your heart rate up. Use controlled movement, shorter rest, and consistent pace. Since your level is ${level}, focus on technique before speed.`;
    }

    if (goal === "muscle_gain") {
        return `This ${bodyPart.replace("_", " ")} plan focuses on hypertrophy. Choose weights that challenge the final reps while keeping your form clean. Since you selected ${equipment}, the exercise mix is adjusted around that setup.`;
    }

    if (goal === "strength") {
        return `This workout emphasizes stronger compound movement patterns. Keep rest periods slightly longer, prioritize quality reps, and increase load gradually over time. As a ${level} trainee, progression should stay controlled and consistent.`;
    }

    return `This ${bodyPart.replace("_", " ")} workout is structured for balanced development and consistency. Focus on steady tempo, good posture, and smooth execution across all exercises.`;
};

/**
 * Converts a raw exercise object into the final format sent to the frontend.
 *
 * Main fix:
 * This keeps steps and tips so the frontend can display all instructions.
 */
const mapExerciseForPlan = (exercise, goal, level) => {
    return {
        name: exercise.name,

        sets: exercise.sets?.[level] || 3,

        reps: exercise.reps?.[goal] || "10-12",

        rest: exercise.rest?.[goal] || "45 sec",

        steps: exercise.steps || [
            `Prepare your body and equipment for ${exercise.name}.`,
            "Start from a safe and stable position.",
            "Perform the movement slowly with controlled form.",
            "Keep your breathing steady and posture correct.",
            "Stop immediately if you feel sharp pain or discomfort.",
        ],

        tips: exercise.tips || [
            "Use a weight or intensity that matches your current fitness level.",
            "Do not rush the movement.",
            "Focus on correct technique before increasing difficulty.",
        ],
    };
};

/**
 * Main workout plan builder.
 *
 * Step-by-step process:
 * 1. Normalize frontend values.
 * 2. Apply safe default values.
 * 3. Decide exercise count by duration.
 * 4. Filter exercises by body part, level, goal, and equipment.
 * 5. Shuffle exercises.
 * 6. Select required number of exercises.
 * 7. Map exercises with sets, reps, rest, steps, and tips.
 * 8. Add warm-up.
 * 9. Add cool-down.
 * 10. Return complete workout plan.
 */
const buildWorkoutPlan = ({
    goal,
    bodyPart,
    level,
    duration,
    equipment,
}) => {
    const safeGoal = normalizeText(goal) || "general_fitness";
    const safeBodyPart = normalizeText(bodyPart) || "full_body";
    const safeLevel = normalizeText(level) || "beginner";
    const safeEquipment = normalizeText(equipment) || "gym";
    const safeDuration = Number(duration) > 0 ? Number(duration) : 30;

    const exerciseCount = getExerciseCountByDuration(safeDuration);

    const filteredExercises = getFilteredExercises({
        bodyPart: safeBodyPart,
        level: safeLevel,
        goal: safeGoal,
        equipment: safeEquipment,
    });

    const randomizedExercises = shuffleArray(filteredExercises)
        .slice(0, exerciseCount)
        .map((exercise) => mapExerciseForPlan(exercise, safeGoal, safeLevel));

    const warmUp = buildWarmUp(safeGoal, safeDuration);
    const coolDown = buildCoolDown(safeGoal);

    const note = buildRecommendationNote({
        goal: safeGoal,
        level: safeLevel,
        bodyPart: safeBodyPart,
        equipment: safeEquipment,
    });

    return {
        title: `${safeLevel.replace("_", " ")} ${safeBodyPart.replace("_", " ")} workout`,
        goal: safeGoal,
        level: safeLevel,
        bodyPart: safeBodyPart,
        duration: safeDuration,
        equipment: safeEquipment,
        note,
        exercises: [warmUp, ...randomizedExercises, coolDown],
    };
};

/**
 * Controller: GET /api/workout-plans/status
 */
export const getWorkoutPlanStatus = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const dateKey = getDateKey();
        const activeMembership = await getActiveMembership(userId);
        const usage = await WorkoutPlanUsage.findOne({
            user: userId,
            dateKey,
        });

        const usedToday = usage?.count || 0;
        const isMembershipUser = !!activeMembership;

        return res.json({
            success: true,
            isMembershipUser,
            usedToday,
            freeDailyLimit: FREE_DAILY_LIMIT,
            remaining: isMembershipUser
                ? "unlimited"
                : Math.max(0, FREE_DAILY_LIMIT - usedToday),
            membershipExpiresAt: activeMembership?.expiresAt || null,
            subscription: activeMembership || null,
        });
    } catch (error) {
        console.error("getWorkoutPlanStatus error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch workout plan status",
            error: error.message,
        });
    }
};

/**
 * Controller: POST /api/workout-plans/generate
 */
export const generateWorkoutPlan = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const {
            goal = "",
            bodyPart = "",
            level = "",
            duration = 30,
            equipment = "",
        } = req.body || {};

        const dateKey = getDateKey();
        const activeMembership = await getActiveMembership(userId);
        const isMembershipUser = !!activeMembership;

        let usage = await WorkoutPlanUsage.findOne({
            user: userId,
            dateKey,
        });

        const usedToday = usage?.count || 0;

        if (!isMembershipUser && usedToday >= FREE_DAILY_LIMIT) {
            return res.status(403).json({
                success: false,
                message:
                    "You have reached your free daily limit. Buy membership for unlimited workout plan generation.",
                isMembershipUser: false,
                usedToday,
                freeDailyLimit: FREE_DAILY_LIMIT,
                remaining: 0,
            });
        }

        const plan = buildWorkoutPlan({
            goal,
            bodyPart,
            level,
            duration,
            equipment,
        });

        if (!usage) {
            usage = await WorkoutPlanUsage.create({
                user: userId,
                dateKey,
                count: 1,
            });
        } else {
            usage.count += 1;
            await usage.save();
        }

        return res.status(200).json({
            success: true,
            message: "Workout plan generated successfully.",
            isMembershipUser,
            usedToday: usage.count,
            freeDailyLimit: FREE_DAILY_LIMIT,
            remaining: isMembershipUser
                ? "unlimited"
                : Math.max(0, FREE_DAILY_LIMIT - usage.count),
            membershipExpiresAt: activeMembership?.expiresAt || null,
            plan,
        });
    } catch (error) {
        console.error("generateWorkoutPlan error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to generate workout plan",
            error: error.message,
        });
    }
};