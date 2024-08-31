import { View, Text, FlatList, RefreshControl, Image } from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyListState from "@/components/EmptyListState";
import SearchInput from "@/components/SearchInput";
import TrendingList from "@/components/TrendingList";
import VideoCard from "@/components/VideoCard";
import { images } from "@/constants";
import { getAllVideos, getLatestVideos, searchVideo } from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrite";
import { Models } from "react-native-appwrite";

const Search = () => {
  const { query } = useLocalSearchParams();
  const { data: posts, refetch } = useAppwrite(() => searchVideo(String(query)));

  const [refreshing, setRefreshing] = useState(false);

  const handleRenderItem = ({ item }: { item: Models.Document }) => {
    return <VideoCard video={item} />;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        renderItem={handleRenderItem}
        ListHeaderComponent={<ListHeader queryText={String(query)} />}
        ListEmptyComponent={
          <EmptyListState
            title="No videos found"
            subtitle="No videos created yet"
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </SafeAreaView>
  );
};

const ListHeader = ({ queryText }: { queryText: string }) => {
  return (
    <View className="my-6 px-4 space-y-4">
      <View className="justify-between items-start flex-row mb-6">
        <View>
          <Text className="font-pmedium text-sm text-gray-100">
            Search result
          </Text>
          <Text className="text-2xl font-psemibold text-white">
            {queryText}
          </Text>
        </View>
        <View className="mt-1.5">
          <Image
            source={images.logoSmall}
            className="w-9 h-10"
            resizeMode="contain"
          />
        </View>
      </View>
      <SearchInput />
    </View>
  );
};

export default Search;
