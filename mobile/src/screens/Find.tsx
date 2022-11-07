import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

import { Heading, VStack, useToast } from "native-base";

import { Button } from "../components/Button";
import { Header } from "../components/Header";
import { Input } from "../components/Input";

import { api } from "../services/api";

export function Find() {
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState("");

  const toast = useToast();
  const { navigate } = useNavigation();

  async function handleJoinPoll() {
    try {
      setIsLoading(true);
      if (!code.trim()) {
        toast.show({
          title: "Insira um código",
          placement: "top",
          bgColor: "red.500",
        });
        return;
      }

      await api.post("/polls/join", { code });
      toast.show({
        title: "Você entrou no bolão",
        placement: "top",
        bgColor: "green.500",
      });
      navigate("polls");
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      switch (error.response?.data?.message) {
        case "Poll not found":
          return toast.show({
            title: "Bolão não encontrado",
            placement: "top",
            bgColor: "red.500",
          });

        case "Already joined":
          return toast.show({
            title: "Você já está participando deste bolão",
            placement: "top",
            bgColor: "red.500",
          });

        default:
          return toast.show({
            title: "Erro ao entrar no bolão",
            placement: "top",
            bgColor: "red.500",
          });
      }
    }
  }

  return (
    <VStack flex={1} bgColor="gray.900">
      <Header title="Buscar por código" showBackButton />

      <VStack mt={8} mx={5} alignItems="center">
        <Heading
          fontFamily="heading"
          color="white"
          fontSize="xl"
          textAlign="center"
          mb={8}
        >
          Encontre um bolão através de{"\n"}seu código único.
        </Heading>

        <Input
          mb={2}
          placeholder="Código do bolão"
          autoCapitalize="characters"
          onChangeText={setCode}
        />
        <Button
          title="buscar bolão"
          isLoading={isLoading}
          onPress={handleJoinPoll}
        />
      </VStack>
    </VStack>
  );
}
