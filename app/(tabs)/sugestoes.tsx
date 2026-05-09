import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Linking,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import { api } from "@/services/api";
import { fetchSubTriggers } from "@/services/suggestions";

type Message = {
  id: string;

  type:
    | "bot"
    | "user"
    | "options"
    | "suboptions"
    | "suggestions";

  text?: string;
  options?: any[];
  suggestions?: any[];
  resources?: any[];
};

export default function Sugestoes() {
  const { trigger } =
    useLocalSearchParams();

  const hasStarted =
    useRef(false);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [
    selectedTriggers,
    setSelectedTriggers,
  ] = useState<string[]>([]);

  const [
    remainingTriggers,
    setRemainingTriggers,
  ] = useState<string[]>([]);

  const [
    tempSelectedTriggers,
    setTempSelectedTriggers,
  ] = useState<string[]>([]);

  const [
    selectedSubOptionIds,
    setSelectedSubOptionIds,
  ] = useState<string[]>([]);

  const [
    usedTriggers,
    setUsedTriggers,
  ] = useState<string[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [
    isChoosingTriggers,
    setIsChoosingTriggers,
  ] = useState(false);

  const [
    isFreeMode,
    setIsFreeMode,
  ] = useState(false);

  useEffect(() => {
    if (
      hasStarted.current &&
      !trigger
    )
      return;

    hasStarted.current = true;

    setMessages([]);

    startConversation();
  }, [trigger]);

  function resetConversation() {
    setMessages([]);
    setSelectedTriggers([]);
    setRemainingTriggers([]);
    setTempSelectedTriggers([]);
    setSelectedSubOptionIds([]);
    setUsedTriggers([]);
    setErro("");
    setIsChoosingTriggers(false);
    setIsFreeMode(true);

    setTimeout(async () => {
      try {
        setLoading(true);

        addBotMessage(
          "Olá 💙 Sobre o que você gostaria de conversar hoje?"
        );

        const response =
          await api.get("/triggers");

        const triggers =
          response.data.data || [];

        addOptions(triggers);
      } catch (error) {
        console.log(error);

        setErro(
          "Erro ao reiniciar conversa."
        );
      } finally {
        setLoading(false);
      }
    }, 100);
  }

  function createMessage(
    type: Message["type"],
    extra: any = {}
  ) {
    return {
      id:
        Date.now().toString() +
        Math.random(),

      type,

      ...extra,
    };
  }

  function addBotMessage(
    text: string
  ) {
    setMessages((prev) => [
      ...prev,
      createMessage("bot", {
        text,
      }),
    ]);
  }

  function addUserMessage(
    text: string
  ) {
    setMessages((prev) => [
      ...prev,
      createMessage("user", {
        text,
      }),
    ]);
  }

  function addOptions(
    options: any[]
  ) {
    setMessages((prev) => [
      ...prev,
      createMessage("options", {
        options,
      }),
    ]);
  }

  function addSubOptions(
    options: any[]
  ) {
    setMessages((prev) => [
      ...prev,
      createMessage(
        "suboptions",
        {
          options,
        }
      ),
    ]);
  }

  function addSuggestions(
    suggestions: any[],
    resources: any[]
  ) {
    setMessages((prev) => [
      ...prev,
      createMessage(
        "suggestions",
        {
          suggestions,
          resources,
        }
      ),
    ]);
  }

  function getEmoji(name: string) {
    const key =
      name.toLowerCase();

    switch (key) {
      case "trabalho":
        return "💼";

      case "escola":
        return "📚";

      case "familia":
      case "família":
        return "👨‍👩‍👧";

      case "transito":
      case "trânsito":
        return "🚗";

      case "amizades":
        return "🧑‍🤝‍🧑";

      case "dinheiro":
        return "💰";

      case "saude":
      case "saúde":
        return "❤️";

      case "sono":
        return "😴";

      default:
        return "💬";
    }
  }

  async function startConversation() {
    try {
      setLoading(true);

      if (trigger) {
        const triggerValue =
          Array.isArray(trigger)
            ? trigger[0]
            : trigger;

        const parsedTriggers =
          triggerValue
            .split(",")
            .map((item) =>
              item.trim()
            )
            .filter(Boolean);

        if (
          parsedTriggers.length >
          0
        ) {
          setSelectedTriggers(
            parsedTriggers
          );

          setRemainingTriggers(
            parsedTriggers
          );

          if (
            parsedTriggers.length >
            1
          ) {
            addBotMessage(
              "Você marcou mais de um gatilho 💙 Sobre qual deles quer falar primeiro?"
            );

            addOptions(
              parsedTriggers.map(
                (
                  trigger
                ) => ({
                  id: trigger,
                  name: trigger,
                })
              )
            );
          } else {
            setUsedTriggers([
              parsedTriggers[0],
            ]);

            startTriggerConversation(
              parsedTriggers[0]
            );
          }

          return;
        }
      }

      setIsFreeMode(true);

      addBotMessage(
        "Olá 💙 Sobre o que você gostaria de conversar hoje?"
      );

      const response =
        await api.get("/triggers");

      const triggers =
        response.data.data || [];

      addOptions(triggers);
    } catch (error) {
      console.log(error);

      setErro(
        "Erro ao iniciar conversa."
      );
    } finally {
      setLoading(false);
    }
  }

  async function startTriggerConversation(
    triggerName: string
  ) {
    addUserMessage(
      `${getEmoji(
        triggerName
      )} ${triggerName}`
    );

    addBotMessage(
      "O que mais contribuiu para isso?"
    );

    try {
      setLoading(true);

      const subTriggers =
        await fetchSubTriggers(
          triggerName
        );

      addSubOptions(
        subTriggers || []
      );
    } catch (error) {
      console.log(error);

      setErro(
        "Erro ao carregar opções."
      );
    } finally {
      setLoading(false);
    }
  }

  function disableAllOptions() {
    setMessages((prev) =>
      prev.map((msg) => {
        if (
          msg.type ===
            "options" ||
          msg.type ===
            "suboptions"
        ) {
          return {
            ...msg,
            options:
              msg.options?.map(
                (opt) => ({
                  ...opt,
                  disabled: true,
                })
              ),
          };
        }

        return msg;
      })
    );
  }

  function handleSelectTrigger(
    item: any
  ) {
    const triggerName =
      item.name;

    if (
      usedTriggers.includes(
        triggerName
      )
    ) {
      return;
    }

    if (
      isFreeMode &&
      selectedTriggers.length ===
        0
    ) {
      setTempSelectedTriggers(
        (prev) => {
          if (
            prev.includes(
              triggerName
            )
          ) {
            return prev.filter(
              (t) =>
                t !==
                triggerName
            );
          }

          return [
            ...prev,
            triggerName,
          ];
        }
      );

      setIsChoosingTriggers(
        true
      );

      return;
    }

    disableAllOptions();

    setUsedTriggers((prev) => [
      ...prev,
      triggerName,
    ]);

    setRemainingTriggers(
      (prev) =>
        prev.filter(
          (t) =>
            t !== triggerName
        )
    );

    startTriggerConversation(
      triggerName
    );
  }

  async function handleSelectSubTrigger(
    item: any
  ) {
    if (
      selectedSubOptionIds.includes(
        item.id.toString()
      )
    ) {
      return;
    }

    disableAllOptions();

    setSelectedSubOptionIds(
      (prev) => [
        ...prev,
        item.id.toString(),
      ]
    );

    try {
      setLoading(true);

      addUserMessage(item.name);

      const response =
        await api.get(
          `/sub-triggers/${item.id}`
        );

      const data =
        response.data.data ||
        response.data;

      addBotMessage(
        "Entendi. Separei algumas sugestões que podem ajudar nesse momento 💙"
      );

      addSuggestions(
        data.suggestions || [],
        data.resources || []
      );

      const availableTriggers =
        remainingTriggers.filter(
          (t) =>
            !usedTriggers.includes(
              t
            )
        );

      if (
        availableTriggers.length >
        0
      ) {
        setTimeout(() => {
          addBotMessage(
            "Quer conversar sobre outro gatilho? 💙"
          );

          addOptions(
            availableTriggers.map(
              (
                trigger
              ) => ({
                id: trigger,
                name: trigger,
              })
            )
          );
        }, 600);
      } else {
        addBotMessage(
          "Você não precisa passar por isso sem apoio 💙"
        );
      }
    } catch (error) {
      console.log(error);

      setErro(
        "Erro ao carregar sugestões."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.container}>
      {messages.length > 0 && (
        <View style={s.resetWrap}>
          <Pressable
            onPress={
              resetConversation
            }
            style={s.resetButton}
          >
            <Text
              style={s.resetText}
            >
              Recomeçar conversa 
            </Text>
          </Pressable>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          s.content
        }
      >
        {messages.map(
          (message) => {
            if (
              message.type ===
              "bot"
            ) {
              return (
                <View
                  key={
                    message.id
                  }
                  style={[
                    s.bubble,
                    s.botBubble,
                  ]}
                >
                  <Text
                    style={
                      s.botText
                    }
                  >
                    {
                      message.text
                    }
                  </Text>
                </View>
              );
            }

            if (
              message.type ===
              "user"
            ) {
              return (
                <View
                  key={
                    message.id
                  }
                  style={[
                    s.bubble,
                    s.userBubble,
                  ]}
                >
                  <Text
                    style={
                      s.userText
                    }
                  >
                    {
                      message.text
                    }
                  </Text>
                </View>
              );
            }

            if (
              message.type ===
              "options"
            ) {
              return (
                <View
                  key={
                    message.id
                  }
                >
                  <View
                    style={
                      s.grid
                    }
                  >
                    {message.options?.map(
                      (
                        item
                      ) => {
                        const isSelected =
                          tempSelectedTriggers.includes(
                            item.name
                          );

                        return (
                          <Pressable
                            key={
                              item.id
                            }
                            disabled={
                              item.disabled
                            }
                            style={[
                              s.gridCard,

     isSelected && {
  borderColor: "#2dd4bf",
  backgroundColor: "rgba(45,212,191,.18)",
  borderWidth: 2,

  shadowColor: "#2dd4bf",
  shadowOpacity: 0.15,
  shadowRadius: 10,
  shadowOffset: {
    width: 0,
    height: 0,
  },

  elevation: 3,
},

                              item.disabled && {
                                opacity: 0.4,
                              },
                            ]}
                            onPress={() =>
                              handleSelectTrigger(
                                item
                              )
                            }
                          >
                            <Text
                              style={
                                s.gridEmoji
                              }
                            >
                              {getEmoji(
                                item.name
                              )}
                            </Text>

                            <Text
                              style={
                                s.gridText
                              }
                            >
                              {
                                item.name
                              }
                            </Text>
                          </Pressable>
                        );
                      }
                    )}
                  </View>

                  {isFreeMode &&
                    isChoosingTriggers &&
                    tempSelectedTriggers.length >
                      0 && (
                      <Pressable
                        style={
                          s.restartButton
                        }
                        onPress={() => {
                          setSelectedTriggers(
                            tempSelectedTriggers
                          );

                          setRemainingTriggers(
                            tempSelectedTriggers
                          );

                          setIsChoosingTriggers(
                            false
                          );

                          setMessages(
                            (prev) =>
                              prev.filter(
                                (
                                  msg
                                ) =>
                                  msg.type !==
                                  "options"
                              )
                          );

                          if (
                            tempSelectedTriggers.length >
                            1
                          ) {
                            addBotMessage(
                              "Você marcou mais de um gatilho 💙 Sobre qual deles quer falar primeiro?"
                            );

                            addOptions(
                              tempSelectedTriggers.map(
                                (
                                  trigger
                                ) => ({
                                  id: trigger,
                                  name: trigger,
                                })
                              )
                            );
                          } else {
                            setUsedTriggers([
                              tempSelectedTriggers[0],
                            ]);

                            startTriggerConversation(
                              tempSelectedTriggers[0]
                            );
                          }
                        }}
                      >
                        <Text
                          style={
                            s.restartText
                          }
                        >
                          Continuar
                        </Text>
                      </Pressable>
                    )}
                </View>
              );
            }

            if (
              message.type ===
              "suboptions"
            ) {
              return (
                <View
                  key={
                    message.id
                  }
                  style={
                    s.optionsWrap
                  }
                >
                  {message.options?.map(
                    (
                      item
                    ) => (
                      <Pressable
                        key={
                          item.id
                        }
                        disabled={
                          item.disabled
                        }
                        style={[
                          s.subOptionButton,

                          item.disabled && {
                            opacity: 0.4,
                          },
                        ]}
                        onPress={() =>
                          handleSelectSubTrigger(
                            item
                          )
                        }
                      >
                        <Text
                          style={
                            s.subOptionText
                          }
                        >
                          {
                            item.name
                          }
                        </Text>
                      </Pressable>
                    )
                  )}
                </View>
              );
            }

            if (
              message.type ===
              "suggestions"
            ) {
              return (
                <View
                  key={
                    message.id
                  }
                >
                  <View
                    style={
                      s.card
                    }
                  >
                    <Text
                      style={
                        s.cardTitle
                      }
                    >
                      Sugestões
                    </Text>

                    {message.suggestions?.map(
                      (
                        item: any
                      ) => (
                        <Text
                          key={
                            item.id
                          }
                          style={
                            s.cardText
                          }
                        >
                          •{" "}
                          {
                            item.text
                          }
                        </Text>
                      )
                    )}
                  </View>

                  {(message.resources ??
                    []).length >
                    0 && (
                    <View
                      style={
                        s.card
                      }
                    >
                      <Text
                        style={
                          s.cardTitle
                        }
                      >
                        Recursos que podem ajudar
                      </Text>

                      {message.resources?.map(
                        (
                          resource: any
                        ) => (
                          <View
                            key={
                              resource.id
                            }
                            style={
                              s.resourceCard
                            }
                          >
                            <Text
                              style={
                                s.resourceType
                              }
                            >
                              RECURSO
                            </Text>

                            <Text
                              style={
                                s.resourceTitle
                              }
                            >
                              {
                                resource.title
                              }
                            </Text>

                            <Pressable
                              onPress={() =>
                                Linking.openURL(
                                  resource.url
                                )
                              }
                            >
                              <Text
                                style={
                                  s.resourceLink
                                }
                              >
                                Abrir recurso
                              </Text>
                            </Pressable>
                          </View>
                        )
                      )}
                    </View>
                  )}
                </View>
              );
            }

            return null;
          }
        )}

        {loading && (
          <View
            style={[
              s.bubble,
              s.botBubble,
            ]}
          >
            <Text
              style={
                s.botText
              }
            >
              Digitando...
            </Text>
          </View>
        )}

        {!!erro && (
          <Text style={s.error}>
            {erro}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F19",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 90,
  },

  resetWrap: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 18,
    alignItems: "flex-end",
    backgroundColor: "#0B0F19",
  },

  resetButton: {
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#243041",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
  },

  resetText: {
    color: "#CBD5E1",
    fontWeight: "700",
    fontSize: 13,
  },

  bubble: {
    padding: 18,
    borderRadius: 22,
    marginBottom: 16,
    maxWidth: "90%",
  },

  botBubble: {
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#1F2937",
    alignSelf: "flex-start",
  },

  userBubble: {
  backgroundColor: "rgba(45,212,191,.14)",

  borderWidth: 1,
  borderColor: "rgba(45,212,191,.30)",

  alignSelf: "flex-end",
},

  botText: {
    color: "#E5E7EB",
    fontSize: 15,
    lineHeight: 24,
  },

  userText: {
    color: "#E5E7EB",
    fontWeight: "700",
    fontSize: 15,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 20,
  },

  gridCard: {
    width: "47%",
    backgroundColor: "#0F172A",
    borderRadius: 22,
    paddingVertical: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#243041",
  },

  gridEmoji: {
    fontSize: 30,
    marginBottom: 10,
  },

  gridText: {
    color: "#E5E7EB",
    fontSize: 15,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  optionsWrap: {
    gap: 12,
    marginBottom: 20,
  },

  subOptionButton: {
    backgroundColor: "#0F172A",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#243041",
  },

  subOptionText: {
    color: "#E5E7EB",
    fontWeight: "700",
    fontSize: 15,
  },

  card: {
    backgroundColor: "#0F172A",
    padding: 20,
    borderRadius: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#1F2937",
  },

  cardTitle: {
    color: "#E5E7EB",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
  },

  cardText: {
    color: "#CBD5E1",
    fontSize: 15,
    lineHeight: 26,
    marginBottom: 10,
  },

  resourceCard: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#243041",
  },

  resourceType: {
    color: "#94A3B8",
    fontWeight: "700",
    marginBottom: 8,
    fontSize: 12,
    letterSpacing: 1,
  },

  resourceTitle: {
    color: "#E5E7EB",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
  },

  resourceLink: {
    color: "#2dd4bf",
    fontWeight: "700",
    fontSize: 14,
  },

  restartButton: {
    backgroundColor: "rgba(45,212,191,.12)",
    borderWidth: 1,
    borderColor: "#2dd4bf",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 24,
  },

  restartText: {
    color: "#CCFBF1",
    fontWeight: "800",
    fontSize: 15,
  },

  error: {
    color: "#F87171",
    marginTop: 20,
    textAlign: "center",
  },
});