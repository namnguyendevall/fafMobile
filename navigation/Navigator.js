import { FontAwesome } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import MainScreen from "../screens/MainScreen";
import HomeScreen from "../screens/worker/HomeScreen";
import ExploreScreen from "../screens/worker/ExploreScreen";
import MessageScreen from "../screens/worker/MessageScreen";
import ProfileScreen from "../screens/worker/ProfileScreen";
import NotificationScreen from "../screens/worker/NotificationScreen";
import JobDetailScreen from "../screens/worker/JobDetailScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import OTPScreen from "../screens/auth/OTPScreen";
import TermsScreen from "../screens/auth/TermsScreen";
import PrivacyScreen from "../screens/auth/PrivacyScreen";
import MyProposalsScreen from "../screens/worker/MyProposalsScreen";
import EditProfileScreen from "../screens/worker/EditProfileScreen";
import WalletScreen from "../screens/worker/WalletScreen";
import DepositScreen from "../screens/worker/DepositScreen";
import PaymentResultScreen from "../screens/worker/PaymentResultScreen";
import WorkHistoryScreen from "../screens/worker/WorkHistoryScreen";
import ChatScreen from "../screens/worker/ChatScreen";
import WithdrawalScreen from "../screens/worker/WithdrawalScreen";
import ChangePasswordScreen from "../screens/worker/ChangePasswordScreen";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const linking = {
  prefixes: ["fafapp://"],
  config: {
    screens: {
      Home: {
        screens: {
          Profile: "profile",
        },
      },
      PaymentResult: "payment-result",
      Wallet: "wallet",
      Deposit: "deposit",
    },
  },
};

export default function Navigator() {
  console.log(">>> [Navigator] Rendering...");
  const StackNavigator = () => {
    console.log(">>> [StackNavigator] Rendering...");
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OTP"
          component={OTPScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Terms"
          component={TermsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Privacy"
          component={PrivacyScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notification"
          component={NotificationScreen}
          options={{
            title: "Notification",
            headerStyle: { backgroundColor: "#020617" },
            headerTitleStyle: { fontWeight: "800", fontSize: 18, color: "#e2e8f0" },
            headerTintColor: "#0891b2",
            headerShadowVisible: false,
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen
          name="JobDetail"
          component={JobDetailScreen}
          options={{
            title: "Job Detail",
            headerStyle: { backgroundColor: "#020617" },
            headerTitleStyle: { fontWeight: "800", fontSize: 18, color: "#e2e8f0" },
            headerTintColor: "#0891b2",
            headerShadowVisible: false,
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen
          name="MyProposals"
          component={MyProposalsScreen}
          options={{
            title: "Ứng tuyển của tôi",
            headerStyle: { backgroundColor: "#020617" },
            headerTitleStyle: { fontWeight: "800", fontSize: 18, color: "#e2e8f0" },
            headerTintColor: "#0891b2",
            headerShadowVisible: false,
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{
            title: "Chỉnh sửa hồ sơ",
            headerStyle: { backgroundColor: "#020617" },
            headerTitleStyle: { fontWeight: "800", fontSize: 18, color: "#e2e8f0" },
            headerTintColor: "#0891b2",
            headerShadowVisible: false,
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen
          name="Wallet"
          component={WalletScreen}
          options={{
            title: "Ví FAF",
            headerStyle: { backgroundColor: "#020617" },
            headerTitleStyle: { fontWeight: "800", fontSize: 18, color: "#e2e8f0" },
            headerTintColor: "#0891b2",
            headerShadowVisible: false,
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen
          name="Deposit"
          component={DepositScreen}
          options={{
            title: "Nạp CRED",
            headerStyle: { backgroundColor: "#020617" },
            headerTitleStyle: { fontWeight: "800", fontSize: 18, color: "#e2e8f0" },
            headerTintColor: "#0891b2",
            headerShadowVisible: false,
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen
          name="PaymentResult"
          component={PaymentResultScreen}
          options={{
            headerShown: false,
            gestureEnabled: false, // Prevent swiping back during result
          }}
        />
        <Stack.Screen
          name="WorkHistory"
          component={WorkHistoryScreen}
          options={{
            title: "Lịch sử công việc",
            headerStyle: { backgroundColor: "#020617" },
            headerTitleStyle: { fontWeight: "800", fontSize: 18, color: "#e2e8f0" },
            headerTintColor: "#0891b2",
            headerShadowVisible: false,
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            headerShown: false, // Custom header in ChatScreen
          }}
        />
        <Stack.Screen
          name="Withdrawal"
          component={WithdrawalScreen}
          options={{
            title: "Rút tiền",
            headerStyle: { backgroundColor: "#020617" },
            headerTitleStyle: { fontWeight: "800", fontSize: 18, color: "#e2e8f0" },
            headerTintColor: "#0891b2",
            headerShadowVisible: false,
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePasswordScreen}
          options={{
            title: "Đổi mật khẩu",
            headerStyle: { backgroundColor: "#020617" },
            headerTitleStyle: { fontWeight: "800", fontSize: 18, color: "#e2e8f0" },
            headerTintColor: "#0891b2",
            headerShadowVisible: false,
            headerBackTitleVisible: false,
          }}
        />
      </Stack.Navigator>
    );
  };

  const TabNavigator = () => {
    return (
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { 
            backgroundColor: "#020617",
            borderTopColor: "#1e293b",
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: "#0891b2",
          tabBarInactiveTintColor: "#64748b",
          tabBarLabelStyle: { fontWeight: "600" },
        }}
      >
        <Tab.Screen
          name="Feed"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome name="rss" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Explore"
          component={ExploreScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome name="search" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Message"
          component={MessageScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome name="commenting-o" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome name="user-circle-o" size={24} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    );
  };

  return (
    <NavigationContainer linking={linking}>
      <StackNavigator />
    </NavigationContainer>
  );
}
