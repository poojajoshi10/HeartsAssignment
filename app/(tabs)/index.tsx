import { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  GestureResponderEvent,
} from "react-native";
import { useAssets } from "expo-asset";

export default function InteractiveHeartsScreen() {
  const [filledHearts, setFilledHearts] = useState<number[]>([]);
  const [starredHearts, setStarredHearts] = useState<number[]>([]);
  const [tooltipVisible, setTooltipVisible] = useState<number | null>(null);

  const scaleAnims = useRef(
    [...Array(7)].map(() => new Animated.Value(1))
  ).current;

  const lastPress = useRef<number>(0);

  const [assets] = useAssets([
    require("../../assets/images/Heart.png"),
    require("../../assets/images/green-heart-filled.png"),
    require("../../assets/images/small-star-filled.png"),
    require("../../assets/images/tooltip-image.png"),
    require("../../assets/images/tooltip-filled.png"),
  ]);

  const handleHeartPress = (index: number, event: GestureResponderEvent) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    const isDoubleClick = now - lastPress.current < DOUBLE_PRESS_DELAY;
    lastPress.current = now;

    const isFilled = filledHearts.includes(index);

    if (isDoubleClick) {
      // Remove heart and star
      setFilledHearts((prev) => prev.filter((i) => i !== index));
      setStarredHearts((prev) => prev.filter((i) => i !== index));
      setTooltipVisible(null);
      return;
    }

    // Animate heart bounce
    Animated.sequence([
      Animated.spring(scaleAnims[index], {
        toValue: isFilled ? 0.9 : 1.2,
        speed: 30,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        speed: 30,
        useNativeDriver: true,
      }),
    ]).start();

    if (!isFilled) {
      setFilledHearts((prev) => [...prev, index]);
      setTooltipVisible(index);
    } else {
      setFilledHearts((prev) => prev.filter((i) => i !== index));
      setTooltipVisible(null);
    }
  };

  const handleTooltipPress = (index: number) => {
    setStarredHearts((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );

    // Let tooltip image update before hiding
    setTimeout(() => setTooltipVisible(null), 300);
  };

  if (!assets) return null;

  return (
    <View style={styles.container}>
      <View style={styles.heartColumn}>
        {[3, 4, 5, 6, 7, 8, 9].map((_, index) => {
          const isFilled = filledHearts.includes(index);
          const isStarred = starredHearts.includes(index);
          const showTooltip = tooltipVisible === index;

          return (
            <View key={index} style={styles.heartRow}>
              <View style={styles.heartWrapper}>
                {showTooltip && (
                  <TouchableOpacity
                    onPress={() => handleTooltipPress(index)}
                    activeOpacity={0.8}
                    style={styles.tooltipLeft}
                  >
                    <Image
                      source={isStarred ? assets[4] : assets[3]}
                      style={styles.tooltipImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={(e) => handleHeartPress(index, e)}
                  activeOpacity={0.9}
                >
                  <Animated.View
                    style={[
                      styles.circleOutline,
                      {
                        borderColor: isFilled
                          ? "rgba(46, 204, 113, 0.3)"
                          : "rgba(200, 200, 200, 0.3)",
                        transform: [{ scale: scaleAnims[index] }],
                      },
                    ]}
                  >
                    <Image
                      source={isFilled ? assets[1] : assets[0]}
                      style={styles.heartImage}
                      resizeMode="contain"
                    />

                    {isFilled && isStarred && (
                      <View style={styles.starIndicator}>
                        <Image
                          source={assets[2]}
                          style={styles.starIndicatorImage}
                          resizeMode="contain"
                        />
                      </View>
                    )}
                  </Animated.View>
                </TouchableOpacity>
              </View>
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
const starIndicatorSize = heartSize * 0.6;

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
  starIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "white",
    borderRadius: starIndicatorSize / 3,
    padding: 2,
  },
  starIndicatorImage: {
    width: starIndicatorSize,
    height: starIndicatorSize,
    tintColor: "#f1c40f",
  },
  tooltipLeft: {
    position: "absolute",
    left: -circleSize * 1.5,
    top: "50%",
    transform: [{ translateY: -circleSize / 2 }],
    zIndex: 10,
  },
  tooltipImage: {
    width: circleSize * 1.4,
    height: circleSize * 1.4,
  },
});
