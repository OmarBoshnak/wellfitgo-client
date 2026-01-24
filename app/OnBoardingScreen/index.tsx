import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    StatusBar,
    Text,
    Image,
    TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swiper from 'react-native-swiper';

import { colors } from '@/src/shared/core/constants/Theme';
import { verticalScale, horizontalScale } from '@/src/shared/core/utils/scaling';
import { Slides } from '@/src/shared/core/constants/Slides';
import {
    OnboardingSlide,
} from '@/src/shared/components/onboarding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ONBOARDING_COMPLETE_KEY = '@wellfitgo_onboarding_complete';

export default function OnBoardingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const swiperRef = useRef<any>(null);

    // React state for current slide
    // React state for current slide
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    // Handle skip - navigate to login
    const handleSkip = useCallback(async () => {
        await markOnboardingComplete();
        router.replace('/(auth)/LoginScreen' as any);
    }, [router]);

    // Handle next slide or complete
    const handleNext = useCallback(async () => {
        const nextIndex = currentSlideIndex + 1;

        if (nextIndex >= Slides.length) {
            // Last slide - complete onboarding
            await markOnboardingComplete();
            router.replace('/(auth)/LoginScreen' as any);
        } else {
            // Use swiper to navigate
            if (swiperRef.current) {
                swiperRef.current.scrollBy(1, true);
            }
        }
    }, [router, currentSlideIndex]);

    // Handle slide change from user interaction
    const handleIndexChanged = useCallback((index: number) => {
        setCurrentSlideIndex(index);
    }, []);

    // Mark onboarding as complete in storage
    const markOnboardingComplete = async () => {
        try {
            await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
        } catch (error) {
            console.error('Failed to save onboarding completion:', error);
        }
    };

    const isLastSlide = currentSlideIndex === Slides.length - 1;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.bgPrimary} />

            {/* Skip button - Top of screen */}
            <View style={styles.skipContainer}>
                <TouchableOpacity
                    style={styles.skipButtonTop}
                    onPress={handleSkip}
                >
                    <Text style={styles.skipButtonTextTop}>تخطي</Text>
                </TouchableOpacity>
            </View>

            <Image source={require('@/assets/slide.png')} style={styles.slideImage} />


            {/* Slides carousel with Swiper */}
            <View style={styles.carouselContainer}>
                <Swiper
                    ref={swiperRef}
                    loop={false}
                    showsPagination={false}
                    onIndexChanged={handleIndexChanged}
                    index={currentSlideIndex}
                    horizontal={true}
                    autoplay={true}
                    autoplayTimeout={3}
                    autoplayDirection={true} // Ensures Right to Left movement (0 -> 1 -> 2)
                >
                    {Slides.map((slide, index) => (
                        <OnboardingSlide
                            key={slide.id}
                            slide={slide}
                            index={index}
                            scrollX={{ value: index * SCREEN_WIDTH }}
                        />
                    ))}
                </Swiper>
            </View>


            {/* Progress dots - Simple replacement */}
            <View style={styles.progressDotsContainer}>
                {Slides.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            index === currentSlideIndex ? styles.dotActive : styles.dotInactive
                        ]}
                    />
                ))}
            </View>

            {/* Next button - Center */}
            <View style={styles.nextContainer}>
                <TouchableOpacity
                    style={[
                        styles.nextButtonCenter,
                        isLastSlide && styles.nextButtonComplete
                    ]}
                    onPress={handleNext}
                >
                    <Text style={styles.nextButtonTextCenter}>
                        {isLastSlide ? 'ابدأ' : 'التالي'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
        alignItems: 'center',
    },
    slideImage: { height: 350, width: 250, marginTop: verticalScale(55) },
    carouselContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingTop: verticalScale(40),
    },
    scrollContent: {
        alignItems: 'center',
    },
    skipContainer: {
        position: 'absolute',
        top: verticalScale(60),
        right: horizontalScale(30),
        zIndex: 1,
    },
    skipButtonTop: {
        paddingHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(8),
        borderRadius: horizontalScale(20),
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.gray,
    },
    skipButtonTextTop: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    progressDotsContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        gap: horizontalScale(8),
        marginVertical: verticalScale(30),
    },
    dot: {
        height: horizontalScale(8),
        borderRadius: horizontalScale(4),
    },
    dotActive: {
        width: horizontalScale(24),
        backgroundColor: colors.primaryDark,
    },
    dotInactive: {
        width: horizontalScale(8),
        backgroundColor: colors.gray,
    },
    nextContainer: {
        alignItems: 'center',
        paddingBottom: verticalScale(40),
    },
    nextButtonCenter: {
        paddingHorizontal: horizontalScale(40),
        paddingVertical: verticalScale(16),
        borderRadius: horizontalScale(25),
        backgroundColor: colors.primaryDark,
        minWidth: horizontalScale(140),
        alignItems: 'center',
    },
    nextButtonComplete: {
        backgroundColor: colors.success,
    },
    nextButtonTextCenter: {
        fontSize: 16,
        color: colors.white,
        fontWeight: '600',
    },
});
