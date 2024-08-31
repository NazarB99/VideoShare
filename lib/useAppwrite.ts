import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { Models } from "react-native-appwrite";

export const useAppwrite = (fn: (...args: any[]) => Promise<Models.Document[]>) => {
  const [data, setData] = useState<Models.Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fn();

      setIsLoading(false);
      setData(response);
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => fetchData();

  return { data, isLoading, refetch };
};
