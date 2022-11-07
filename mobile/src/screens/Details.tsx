import { useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Share } from "react-native";

import { HStack, useToast, VStack } from "native-base";

import { Header } from "../components/Header";
import { Loading } from "../components/Loading";
import { PollHeader } from "../components/PollHeader";
import { EmptyMyPollList } from "../components/EmptyMyPollList";
import { Option } from "../components/Option";

import { PollProps } from "../components/PollCard";

import { api } from "../services/api";
import { Guesses } from "../components/Guesses";

interface RouteParams {
  id: string;
}

export function Details() {
  const [isLoading, setIsLoading] = useState(true);
  const [pollDetails, setPollDetails] = useState({} as PollProps);
  const [optionSelected, setOptionSelected] = useState(true);

  const toast = useToast();

  const route = useRoute();

  const { id } = route.params as RouteParams;

  useEffect(() => {
    fetchPollDetails();
  }, [id]);

  async function fetchPollDetails() {
    try {
      setIsLoading(true);
      const response = await api.get(`/polls/${id}`);
      setPollDetails(response.data.poll);
    } catch (error) {
      console.log(error);

      toast.show({
        title: "Erro ao carregar bolão",
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCodeShare() {
    await Share.share({
      message: `Bolão: ${pollDetails.title} - Código: ${pollDetails.code}`,
    });
  }

  if (isLoading) {
    return <Loading />;
  }
  return (
    <VStack flex={1} bgColor="gray.900">
      <Header
        title={pollDetails?.title}
        showBackButton
        showShareButton
        onShare={handleCodeShare}
      />

      {pollDetails?._count?.participants ? (
        <VStack px={5} flex={1}>
          <PollHeader data={pollDetails} />

          <HStack bgColor="gray.800" p={1} rounded="sm" mb={5}>
            <Option
              title="Seus palpites"
              isSelected={optionSelected}
              onPress={() => setOptionSelected(true)}
            />
            <Option
              title="Ranking do grupo"
              isSelected={!optionSelected}
              onPress={() => setOptionSelected(false)}
            />
          </HStack>

          <Guesses pollId={pollDetails.id} pollCode={pollDetails.code} />
        </VStack>
      ) : (
        <EmptyMyPollList code={pollDetails.code} />
      )}
    </VStack>
  );
}
