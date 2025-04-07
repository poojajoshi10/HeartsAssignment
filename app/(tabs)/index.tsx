import { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { useAssets } from "expo-asset";

export default function InteractiveHeartsScreen() {
  const [filledHearts, setFilledHearts] = useState<number[]>([]);
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const circleScaleAnim = useRef(
    [...Array(7)].map(() => new Animated.Value(1))
  ).current;
  const tooltipScaleAnim = useRef(
    [...Array(7)].map(() => new Animated.Value(0))
  ).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load assets
  const [assets] = useAssets([
    require("../../assets/images/Heart.png"),
    require("../../assets/images/green-heart-filled.png"),
    require("../../assets/images/tooltip-image.png"),
  ]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const animatePop = (index: number, show: boolean) => {
    // Fast circle bounce animation (150ms total)
    Animated.sequence([
      Animated.spring(circleScaleAnim[index], {
        toValue: show ? 1.2 : 0.8,
        speed: 30,
        useNativeDriver: true,
      }),
      Animated.spring(circleScaleAnim[index], {
        toValue: 1,
        speed: 30,
        useNativeDriver: true,
      }),
    ]).start();

    // Fast tooltip bounce animation
    Animated.spring(tooltipScaleAnim[index], {
      toValue: show ? 1 : 0,
      speed: 30,
      bounciness: show ? 15 : 0,
      useNativeDriver: true,
    }).start();
  };

  const handleHeartPress = (index: number) => {
    const isFilled = filledHearts.includes(index);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isFilled) {
      // Unfill animation
      animatePop(index, false);
      setFilledHearts(filledHearts.filter((i) => i !== index));
      setActiveTooltip(null);
    } else {
      // Fill animation
      setFilledHearts([...filledHearts, index]);
      setActiveTooltip(index);
      animatePop(index, true);

      // Auto-close after 1 seconds
      timeoutRef.current = setTimeout(() => {
        if (activeTooltip === index) {
          animatePop(index, false);
          setActiveTooltip(null);
          setFilledHearts(filledHearts.filter((i) => i !== index));
        }
      }, 1000);
    }
  };

  if (!assets) return null;

  return (
    <View style={styles.container}>
      <View style={styles.heartColumn}>
        {[3, 4, 5, 6, 7, 8, 9].map((_, index) => {
          const isActive = filledHearts.includes(index);
          return (
            <View key={index} style={styles.heartRow}>
              <TouchableOpacity
                onPress={() => handleHeartPress(index)}
                activeOpacity={0.9}
                style={styles.heartWrapper}
              >
                {/* Tooltip on left with no gap */}
                <Animated.View
                  style={[
                    styles.tooltipContainer,
                    {
                      transform: [{ scale: tooltipScaleAnim[index] }],
                      opacity: tooltipScaleAnim[index],
                    },
                  ]}
                >
                  <Image
                    source={assets[2]}
                    style={styles.tooltipImage}
                    resizeMode="contain"
                  />
                </Animated.View>

                {/* Heart with circle outline */}
                <Animated.View
                  style={[
                    styles.circleOutline,
                    {
                      borderColor: isActive
                        ? "rgba(46, 204, 113, 0.3)"
                        : "rgba(200, 200, 200, 0.3)",
                      transform: [{ scale: circleScaleAnim[index] }],
                    },
                  ]}
                >
                  <Image
                    source={isActive ? assets[1] : assets[0]}
                    style={styles.heartImage}
                    resizeMode="contain"
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const { width } = Dimensions.get("window");
const heartSize = width * 0.05;
const circleSize = heartSize * 2;
const tooltipWidth = width * 0.22;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  heartColumn: {
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    marginLeft: -tooltipWidth / 2, // Compensate for tooltip width
  },
  heartRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heartWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  circleOutline: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    borderWidth: 1.2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  heartImage: {
    width: heartSize,
    height: heartSize,
    tintColor: "#2ecc71",
  },
  tooltipContainer: {
    marginRight: 0, // No gap between tooltip and heart
    zIndex: 2,
  },
  tooltipImage: {
    width: tooltipWidth,
    height: tooltipWidth * 0.6,
  },
});
