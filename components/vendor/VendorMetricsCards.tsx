import React from "react";
import { View, StyleSheet } from "react-native";
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
}

export const VendorMetricsCards: React.FC<VendorMetricsCardsProps> = ({
  metrics,
}) => {
  return (
    <View style={styles.metricsGrid}>
      {metrics.map((metric) => {
        const cardStyle = {
          ...styles.metricCard,
          backgroundColor: metric.color,
        };
        return (
          <ResponsiveCard key={metric.id} variant="elevated" style={cardStyle}>
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
  metricCard: {
    width: "48%",
    padding: PADDING.md,
    marginBottom: MARGIN.md,
    marginHorizontal: "1%",
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
