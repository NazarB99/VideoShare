import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchInput from "@/components/SearchInput";
import EmptyListState from "@/components/EmptyListState";
import { getUserBookmarkedVideos } from "@/lib/appwrite";
import { Models } from "react-native-appwrite";
import { useAppwrite } from "@/lib/useAppwrite";
import VideoCard from "@/components/VideoCard";
import { useGlobalContext } from "@/context/GlobalProvider";

const Bookmark = () => {
  const { user } = useGlobalContext();
  const { data: posts, refetch } = useAppwrite(() =>
    getUserBookmarkedVideos(user?.$id ?? "")
  );

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
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={
          <EmptyListState
            title="No videos found"
            subtitle="Explore new videos"
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </SafeAreaView>
  );
};

const ListHeader = () => {
  return (
    <View className="my-6 px-4 space-y-4">
      <View className="justify-between items-start flex-row mb-6">
        <View>
          <Text className="text-2xl font-psemibold text-white">Bookmark</Text>
        </View>
      </View>
      <SearchInput />
    </View>
  );
};

export default Bookmark;
