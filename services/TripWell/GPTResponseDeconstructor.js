function deconstructGPTResponse(response) {
  if (!response || typeof response.toJSON !== "function") {
    throw new Error("Invalid OpenAI response object");
  }

  const raw = response.toJSON();

  return {
    id: raw.id,
    object: raw.object,
    created: raw.created,
    model: raw.model,
    choices: raw.choices.map((choice) => ({
      index: choice.index,
      finish_reason: choice.finish_reason,
      message: {
        role: choice.message.role,
        content: choice.message.content,
      },
    })),
    usage: {
      prompt_tokens: raw.usage?.prompt_tokens || null,
      completion_tokens: raw.usage?.completion_tokens || null,
      total_tokens: raw.usage?.total_tokens || null,
    },
  };
}

module.exports = { deconstructGPTResponse };
