
interface AccessibilityConfig {
    highContrast?: boolean;
    fontSize?: 'extra-large' | 'large' | 'default';
    voiceOver?: 'full' | 'partial' | 'none';
    blockOnError?: boolean;
    disableBackspace?: boolean;
    games?: boolean;
    anchoringLessons?: boolean;
    virtualKeyboardGuide?: 'right' | 'left' | 'both' | 'none';
    closedCaptioning?: boolean;
    dyslexicFont?: boolean;
}

interface LessonConfig {
    disableBackspace: boolean;
    blockOnError: boolean;
    lockVirtualKeyboard: boolean;
    lockLanguage: boolean;
    lockHands: boolean;
    soundFx: boolean;
    voiceOver: boolean;
    theme: string;
    font: string;
    showReplayButton: boolean;
    showLowercaseLetters: boolean;
    speedAdjustment: number;
    accuracyRequirement: number;
    // Add accessibility-specific configs
    highContrast?: boolean;
    fontSize?: string;
    virtualKeyboardGuide?: string;
    closedCaptioning?: boolean;
    games?: boolean;
    anchoringLessons?: boolean;
}

export function getAccessibilityConfig(accessibilityModes: string[]): AccessibilityConfig {
    const config: AccessibilityConfig = {};

    accessibilityModes.forEach(mode => {
        switch (mode) {
            case 'blind':
                config.highContrast = true;
                config.fontSize = 'extra-large';
                config.voiceOver = 'full';
                config.blockOnError = true;
                config.disableBackspace = true;
                config.games = false;
                config.anchoringLessons = false;
                break;

            case 'low_vision':
                config.fontSize = 'large';
                config.voiceOver = 'full';
                config.games = false;
                break;

            case 'dyslexic':
                config.fontSize = 'large';
                config.dyslexicFont = true;
                break;

            case 'right_hand_only':
                config.virtualKeyboardGuide = 'right';
                config.anchoringLessons = false;
                break;

            case 'left_hand_only':
                config.virtualKeyboardGuide = 'left';
                config.anchoringLessons = false;
                break;

            case 'hard_of_hearing':
                config.closedCaptioning = true;
                break;
        }
    });

    return config;
}

export function computeLessonConfig(
    lesson: any,
    classSettings: any,
    classCourseSettings: any,
    studentAccessibility: string[]
): LessonConfig {
    // Start with lesson defaults
    const config: LessonConfig = {
        disableBackspace: lesson.disableBackspace || false,
        blockOnError: lesson.blockOnError || false,
        lockVirtualKeyboard: false,
        lockLanguage: false,
        lockHands: false,
        soundFx: true,
        voiceOver: false,
        theme: 'default',
        font: 'default',
        showReplayButton: true,
        showLowercaseLetters: false,
        speedAdjustment: 0,
        accuracyRequirement: 0,
    };

    // Apply class-course settings (override lesson)
    if (classCourseSettings) {
        if (classCourseSettings.speedAdjustment !== undefined) {
            config.speedAdjustment += classCourseSettings.speedAdjustment;
        }
        if (classCourseSettings.accuracyRequirement !== undefined) {
            config.accuracyRequirement = classCourseSettings.accuracyRequirement;
        }
    }

    // Apply class settings (override class-course)
    if (classSettings) {
        if (classSettings.disableBackspace !== undefined) {
            config.disableBackspace = classSettings.disableBackspace;
        }
        if (classSettings.blockOnError !== undefined) {
            config.blockOnError = classSettings.blockOnError;
        }
        if (classSettings.lockVirtualKeyboard !== undefined) {
            config.lockVirtualKeyboard = classSettings.lockVirtualKeyboard;
        }
        if (classSettings.lockLanguage !== undefined) {
            config.lockLanguage = classSettings.lockLanguage;
        }
        if (classSettings.lockHands !== undefined) {
            config.lockHands = classSettings.lockHands;
        }
        if (classSettings.soundFx !== undefined) {
            config.soundFx = classSettings.soundFx;
        }
        if (classSettings.voiceOver !== undefined) {
            config.voiceOver = classSettings.voiceOver;
        }
        if (classSettings.theme) {
            config.theme = classSettings.theme;
        }
        if (classSettings.font) {
            config.font = classSettings.font;
        }
        if (classSettings.showReplayButton !== undefined) {
            config.showReplayButton = classSettings.showReplayButton;
        }
        if (classSettings.showLowercaseLetters !== undefined) {
            config.showLowercaseLetters = classSettings.showLowercaseLetters;
        }
    }

    // Apply student accessibility settings (highest priority)
    if (studentAccessibility && studentAccessibility.length > 0) {
        const accessibilityConfig = getAccessibilityConfig(studentAccessibility);

        if (accessibilityConfig.highContrast !== undefined) {
            config.highContrast = accessibilityConfig.highContrast;
        }
        if (accessibilityConfig.fontSize) {
            config.fontSize = accessibilityConfig.fontSize;
        }
        if (accessibilityConfig.voiceOver) {
            config.voiceOver = accessibilityConfig.voiceOver === 'full';
        }
        if (accessibilityConfig.blockOnError !== undefined) {
            config.blockOnError = accessibilityConfig.blockOnError;
        }
        if (accessibilityConfig.disableBackspace !== undefined) {
            config.disableBackspace = accessibilityConfig.disableBackspace;
        }
        if (accessibilityConfig.games !== undefined) {
            config.games = accessibilityConfig.games;
        }
        if (accessibilityConfig.anchoringLessons !== undefined) {
            config.anchoringLessons = accessibilityConfig.anchoringLessons;
        }
        if (accessibilityConfig.virtualKeyboardGuide) {
            config.virtualKeyboardGuide = accessibilityConfig.virtualKeyboardGuide;
        }
        if (accessibilityConfig.closedCaptioning !== undefined) {
            config.closedCaptioning = accessibilityConfig.closedCaptioning;
        }
        if (accessibilityConfig.dyslexicFont) {
            config.font = 'dyslexic';
        }
    }

    return config;
}
