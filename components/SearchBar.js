import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const GRAY_LIGHT = "#9CA3AF";

export default function SearchBar({
  placeholder = "Search gigs, tasks, companies...",
  value,
  onChangeText,
  onFilterPress,
  editable = false,
}) {
  return (
    <View style={styles.searchBar}>
      <Ionicons name="search" size={20} color={GRAY_LIGHT} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor={GRAY_LIGHT}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
      />
      <TouchableOpacity onPress={onFilterPress}>
        <Ionicons name="options-outline" size={22} color={GRAY_LIGHT} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    padding: 0,
  },
});
