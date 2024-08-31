import { View, Image, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { icons, images } from "@/constants";
import { router, usePathname } from "expo-router";

const SearchInput = () => {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const handleChangeText = (text: string) => {
    setQuery(text);
  };

  const handleSearchPress = () => {
    if (!query) return;

    if (pathname.startsWith("/search")) {
      router.setParams({ query });
    } else {
      router.push(`/search/${query}`);
    }
  };

  return (
    <View className="border-2 border-black-200 w-full h-16 px-4 bg-black-100 rounded-2xl focus:border-secondary items-center flex-row space-x-4">
      <TextInput
        autoCapitalize="none"
        className="flex-1 mt-0.5 text-white font-pregular text-base"
        value={query}
        returnKeyType="search"
        onSubmitEditing={handleSearchPress}
        placeholder="Search for a video"
        placeholderTextColor="#cdcde0"
        onChangeText={handleChangeText}
      />

      <TouchableOpacity onPress={handleSearchPress}>
        <Image source={icons.search} className="w-5 h-5" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;
