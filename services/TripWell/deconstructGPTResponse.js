// services/TripWell/deconstructGPTResponse.js

function deconstructGPTResponse(response) {
  if (
    !response ||
    typeof response !== "object" ||
    !Array.isArray(response.choices)
  ) {
    throw new Error("Invalid GPT response structure");
  }

  return {
    id: response.id,
    object: response.object,
    created: response.created,
    model: response.model,
    choices: response.choices.map((choice) => ({
      index: choice.index,
      finish_reason: choice.finish_reason,
      message: {
        role: choice.message?.role || "assistant",
        content: choice.message?.content || "",
      },
    })),
    usage: {
      prompt_tokens: response.usage?.prompt_tokens || null,
      completion_tokens: response.usage?.completion_tokens || null,
      total_tokens: response.usage?.total_tokens || null,
    },
  };
}

module.exports = { deconstructGPTResponse };
