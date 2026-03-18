import React, { useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Dimensions, 
  Animated, 
  Platform 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get("window");

const BG_BASE = "#020617";
const BG_SURFACE = "#090e17";
const CYAN_ACCENT = "#22d3ee";
const PURPLE_ACCENT = "#c084fc";
const TEXT_PRIMARY = "#f8fafc";
const TEXT_SECONDARY = "#94a3b8";

/* ══════════════════════════════════════════════════════
   DYNAMIC BACKGROUND PARTICLES
   Simple floating dots to create atmospheric depth
══════════════════════════════════════════════════════ */
const Particle = ({ delay }) => {
  const moveAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  const startPos = {
    x: Math.random() * width,
    y: Math.random() * height
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(moveAnim, {
            toValue: 1,
            duration: 15000 + Math.random() * 10000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacityAnim, { toValue: 0.4, duration: 2000, useNativeDriver: true }),
            Animated.delay(10000),
            Animated.timing(opacityAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
          ])
        ])
      ])
    ).start();
  }, []);

  const translateY = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -100 - Math.random() * 200]
  });

  return (
    <Animated.View 
      style={[
        styles.particle, 
        { 
          left: startPos.x, 
          top: startPos.y, 
          opacity: opacityAnim,
          transform: [{ translateY }]
        }
      ]} 
    />
  );
};

export default function MainScreen() {
  const navigate = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <View style={styles.safeArea}>
      {/* Dynamic Background Layer */}
      <View style={StyleSheet.absoluteFill}>
        {[...Array(20)].map((_, i) => (
          <Particle key={i} delay={i * 500} />
        ))}
      </View>

      {/* Grid Overlay */}
      <View style={styles.gridOverlay} />

      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* HUD Corners */}
        <View style={[styles.hudCorner, styles.topLeft]} />
        <View style={[styles.hudCorner, styles.topRight]} />
        <View style={[styles.hudCorner, styles.bottomLeft]} />
        <View style={[styles.hudCorner, styles.bottomRight]} />

        {/* Central Content */}
        <View style={styles.centralContent}>
          <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
            <View style={styles.logoGlow} />
            <Image
              source={require("../assets/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>

          <View style={styles.titleSection}>
            <Text style={styles.appTitle}>
              FAF<Text style={{color: CYAN_ACCENT}}>_MOBILE</Text>
            </Text>
            <View style={styles.titleUnderline} />
            <Text style={styles.welcomeSubtitle}>
              SECURE GLOBAL CYBER-FREELANCE PROTOCOL v2.0
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigate.navigate("Login")}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[CYAN_ACCENT, '#0891b2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBtn}
              >
                <Text style={styles.primaryButtonText}>TRUY CẬP HỆ THỐNG</Text>
              </LinearGradient>
              <View style={styles.btnFlash} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigate.navigate("Register")}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>KHỞI TẠO DANH TÍNH</Text>
              <View style={styles.btnClip} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>SYSTEM STATUS: <Text style={{color: '#4ade80'}}>READY</Text></Text>
          <Text style={styles.versionText}>ENCRYPTED CONNECTION v2.4.9</Text>
        </View>
      </Animated.View>

      {/* Scanline Overlay */}
      <View style={styles.scanline} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_BASE,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
    borderWidth: 0.5,
    borderColor: CYAN_ACCENT,
    // Note: React Native doesn't support background-image grids easily, 
    // but we can use border patterns or just atmospheric glow.
  },
  container: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: "space-between",
    paddingVertical: 60,
  },
  hudCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: CYAN_ACCENT + '60',
    borderWidth: 2,
  },
  topLeft: { top: 40, left: 20, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 40, right: 20, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 40, left: 20, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 40, right: 20, borderLeftWidth: 0, borderTopWidth: 0 },
  
  centralContent: {
    alignItems: "center",
    marginTop: height * 0.1,
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logoGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    backgroundColor: CYAN_ACCENT,
    borderRadius: 100,
    opacity: 0.15,
    transform: [{ scale: 1.2 }],
    shadowColor: CYAN_ACCENT,
    shadowRadius: 50,
    shadowOpacity: 0.8,
    elevation: 20,
  },
  logoImage: {
    width: 140,
    height: 140,
    zIndex: 1,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: TEXT_PRIMARY,
    letterSpacing: 6,
    textShadowColor: CYAN_ACCENT + '80',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: CYAN_ACCENT,
    marginVertical: 15,
  },
  welcomeSubtitle: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    textAlign: "center",
    fontWeight: '900',
    letterSpacing: 2,
    opacity: 0.8,
  },
  buttonsContainer: {
    width: "100%",
    gap: 20,
  },
  primaryButton: {
    width: "100%",
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: CYAN_ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  gradientBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 2,
  },
  secondaryButton: {
    width: "100%",
    height: 56,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: CYAN_ACCENT + '40',
    alignItems: "center",
    justifyContent: "center",
    position: 'relative',
  },
  secondaryButtonText: {
    color: CYAN_ACCENT,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2,
  },
  btnClip: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: CYAN_ACCENT,
  },
  footer: {
    alignItems: "center",
    gap: 8,
  },
  footerLine: {
    width: 40,
    height: 1,
    backgroundColor: '#1e293b',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    fontWeight: "900",
    letterSpacing: 2,
  },
  versionText: {
    fontSize: 8,
    color: '#334155',
    fontWeight: "700",
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: CYAN_ACCENT,
    borderRadius: 2,
  },
  scanline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    zIndex: 100,
    // Animation via JS/Native driver can be added here
  }
});
