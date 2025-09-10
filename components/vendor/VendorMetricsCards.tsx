import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, MARGIN, PADDING } from "@/constants";
import { ResponsiveText, ResponsiveCard } from "@/components/UI";

interface MetricData {
  id: string;
  title: string;
  value: string;
  growth: string;
  icon: string;
  color: string;
}

interface VendorMetricsCardsProps {
  metrics: MetricData[];
  onMetricPress?: (metric: MetricData) => void;
}

export const VendorMetricsCards: React.FC<VendorMetricsCardsProps> = ({
  metrics,
  onMetricPress,
}) => {
  return (
    <View style={styles.metricsGrid}>
      {metrics.map((metric) => {
        const cardStyle = {
          ...styles.metricCard,
          backgroundColor: metric.color,
        };

        const cardContent = (
          <ResponsiveCard variant="elevated" style={cardStyle}>
            <View style={styles.metricContent}>
              <View style={styles.metricHeader}>
                <View
                  style={[styles.metricIcon, { backgroundColor: COLORS.white }]}
                >
                  <Ionicons
                    name={metric.icon as any}
                    size={20}
                    color={metric.color}
                  />
                </View>
                <View style={styles.growthIndicator}>
                  <Ionicons name="trending-up" size={12} color={COLORS.white} />
                  <ResponsiveText
                    variant="caption2"
                    color={COLORS.white}
                    weight="medium"
                  >
                    {metric.growth}
                  </ResponsiveText>
                </View>
              </View>
              <ResponsiveText
                variant="h2"
                weight="bold"
                color={COLORS.white}
                style={styles.metricValue}
              >
                {metric.value}
              </ResponsiveText>
              <ResponsiveText
                variant="caption1"
                color={COLORS.white}
                style={styles.metricLabel}
              >
                {metric.title}
              </ResponsiveText>
            </View>
          </ResponsiveCard>
        );

        // Only wrap with TouchableOpacity if onMetricPress is provided
        if (onMetricPress) {
          return (
            <TouchableOpacity
              key={metric.id}
              onPress={() => onMetricPress(metric)}
              activeOpacity={0.8}
              style={styles.cardWrapper}
            >
              {cardContent}
            </TouchableOpacity>
          );
        }

        return (
          <View key={metric.id} style={styles.cardWrapper}>
            {cardContent}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: MARGIN.md,
    marginBottom: MARGIN.lg,
  },
  cardWrapper: {
    width: "48%",
    marginBottom: MARGIN.md,
    marginHorizontal: "1%",
  },
  metricCard: {
    width: "100%",
    padding: PADDING.md,
    borderRadius: 12,
  },
  metricContent: {
    flex: 1,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MARGIN.sm,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  growthIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: MARGIN.xs,
  },
  metricValue: {
    marginBottom: MARGIN.xs,
  },
  metricLabel: {
    textAlign: "left",
  },
});

export default VendorMetricsCards;
