import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "@/constants";
import SearchInput from "@/components/SearchInput";
import TrendingList from "@/components/TrendingList";
import EmptyListState from "@/components/EmptyListState";
import { getAllVideos, getLatestVideos } from "@/lib/appwrite";
import { Models } from "react-native-appwrite";
import { useAppwrite } from "@/lib/useAppwrite";
import VideoCard from "@/components/VideoCard";
import { useGlobalContext } from "@/context/GlobalProvider";

const Home = () => {
  const { data: posts, refetch } = useAppwrite(getAllVideos);
  const { data: latestPosts } = useAppwrite(getLatestVideos);

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
        ListHeaderComponent={<ListHeader latestVideos={latestPosts} />}
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

const ListHeader = ({ latestVideos }: { latestVideos: Models.Document[] }) => {
  const { user } = useGlobalContext();

  return (
    <View className="my-6 px-4 space-y-4">
      <View className="justify-between items-start flex-row mb-6">
        <View>
          <Text className="font-pmedium text-sm text-gray-100">
            Welcome back,
          </Text>
          <Text className="text-2xl font-psemibold text-white">
            {user?.username}
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
      <View className="w-full flex-1 pt-5 pb-8">
        <Text className="text-gray-100 text-lg font-pregular mb-3">
          Trending videos
        </Text>
      </View>
      <TrendingList posts={latestVideos} />
    </View>
  );
};

export default Home;
