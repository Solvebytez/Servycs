import { View, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ResponsiveText, ResponsiveCard, GlobalStatusBar } from "@/components";
import { SPACING, PADDING, MARGIN, COLORS } from "@/constants";

export default function RoleSelectionScreen() {
  const router = useRouter();

  const handleRoleSelection = (role: string) => {
    // Store selected role for later use
    // TODO: Store in context or async storage
    console.log("Selected role:", role);

    // Navigate to authentication screen with role parameter
    router.push(`/(auth)/auth?role=${role}`);
  };

  // Role data array
  const roles = [
    {
      id: "user",
      title: "User",
      subtitle: "Browse & discover",
      icon: require("../../assets/user.png"),
      iconSize: 40,
      marginBottom: MARGIN.sm,
    },
    {
      id: "vendor",
      title: "Vendor",
      subtitle: "Sell Your Products",
      icon: require("../../assets/user-laptop.png"),
      iconSize: 40,
      marginBottom: MARGIN.sm,
    },
    {
      id: "salesman",
      title: "Salesman",
      subtitle: "Drive sales growth",
      icon: require("../../assets/businessman.png"),
      iconSize: 40,
      marginBottom: MARGIN.md,
    },
  ];

  return (
    <>
      <GlobalStatusBar />
      <View style={{ flex: 1 }}>
        <LinearGradient
          colors={[COLORS.primary[200], "#E0F7FF", COLORS.background.primary]}
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.6, 1]}
        >
          {/* Logo Section - In Blue Area */}
          <View
            style={{
              alignItems: "center",
              paddingTop: MARGIN.xl,
              paddingBottom: MARGIN.md,
            }}
          >
            <Image
              source={require("../../assets/logo.png")}
              style={{ width: 100, height: 100, marginBottom: MARGIN.sm }}
              resizeMode="contain"
            />
            <ResponsiveText
              variant="body3"
              weight="medium"
              color={COLORS.white}
              align="center"
            >
              Your world, organized
            </ResponsiveText>
          </View>

          {/* Content Section - In White Area */}
          <View
            style={{
              flex: 1,
              paddingHorizontal: PADDING.screen,
              paddingTop: MARGIN.md,
            }}
          >
            {/* Role Selection Section */}
            <View style={{ flex: 1, alignItems: "center" }}>
              <ResponsiveText
                variant="h5"
                weight="bold"
                color={COLORS.text.primary}
                align="center"
                style={{ marginBottom: MARGIN.lg }}
              >
                Choose your role to continue
              </ResponsiveText>

              {/* Role Cards - Generated from loop */}
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.id}
                  onPress={() => handleRoleSelection(role.id)}
                  style={{ width: "100%", marginBottom: role.marginBottom }}
                >
                  <ResponsiveCard
                    variant="elevated"
                    size="auto"
                    padding="medium"
                    margin="none"
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      minHeight: 80,
                    }}
                  >
                    <View
                      style={{
                        width: 50,
                        height: 50,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: MARGIN.md,
                      }}
                    >
                      <Image
                        source={role.icon}
                        style={{ width: role.iconSize, height: role.iconSize }}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ResponsiveText
                        variant="cardTitle"
                        size={14}
                        weight="bold"
                        color={COLORS.text.primary}
                        style={{ marginBottom: SPACING.xs }}
                      >
                        {role.title}
                      </ResponsiveText>
                      <ResponsiveText
                        variant="cardSubtitle"
                        size={12}
                        color={COLORS.text.secondary}
                      >
                        {role.subtitle}
                      </ResponsiveText>
                    </View>
                    <ResponsiveText
                      variant="h3"
                      weight="bold"
                      color={COLORS.text.light}
                    >
                      ›
                    </ResponsiveText>
                  </ResponsiveCard>
                </TouchableOpacity>
              ))}
            </View>

            {/* Instruction Text - Pushed to Bottom */}
            <ResponsiveText
              variant="body3"
              size={12}
              color={COLORS.text.primary}
              align="center"
              style={{ marginBottom: MARGIN.lg + 10, lineHeight: 18 }}
            >
              Select the option that best describes your role to personalize
              your experience.
            </ResponsiveText>
          </View>
        </LinearGradient>
      </View>
    </>
  );
}
