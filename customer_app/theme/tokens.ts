export const colors = {
    brand: {
        primary: '#0A1F35',
        accent: '#DA6F2B',
    },
    background: {
        screen: '#0A1F35',
        card: '#FFFFFF',
        cardDark: '#142A44',
    },
    text: {
        primary: '#FFFFFF',
        secondary: '#B6C0CC',
        dark: '#0A1F35',
        muted: '#8A97A6',
    },
    status: {
        success: '#2ECC71',
        warning: '#F1C40F',
        error: '#E74C3C',
        info: '#3498DB',
        onlineBooked: '#DA6F2B',
        offlineBooked: '#4A90E2',
        blocked: '#E74C3C',
    },
    divider: '#223A55',
};

export const spacing = {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
};

export const typography = {
    fontFamily: 'Inter',
    heading: {
        h1: { size: 28, weight: '700' as const },
        h2: { size: 22, weight: '600' as const },
        h3: { size: 18, weight: '600' as const },
    },
    body: {
        large: { size: 16, weight: '500' as const },
        regular: { size: 14, weight: '400' as const },
        small: { size: 12, weight: '400' as const },
    },
};

export const radius = {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    pill: 999,
};

export const shadows = {
    card: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },
    elevated: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 15,
        elevation: 6,
    },
};
