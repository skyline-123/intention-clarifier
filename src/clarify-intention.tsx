import {
  Form,
  ActionPanel,
  Action,
  showToast,
  Toast,
  Clipboard,
  closeMainWindow,
  PopToRootType,
  getPreferenceValues,
} from "@raycast/api";
import { useForm } from "@raycast/utils"
import { useEffect } from "react";

interface IntentionForm {
  task: string;
  mood: string[];
  reason: string;
}

// Assuming there's a preferences setup in the extension's package.json for customMoods
const { customMoods } = getPreferenceValues<{ customMoods: string }>();

export default function IntentionClarifier() {
  const moods = customMoods
      .split(",")
      .map((mood) => mood.trim())
      .filter((mood) => mood !== "");

  const { handleSubmit, itemProps, setValue, values } = useForm<IntentionForm>({
    initialValues: {
      task: "",
      mood: [],
      reason: "",
    },
    onSubmit: async (data) => await handleSubmitForm(data, "copy"),
    validation: {
      task: (value) => (!value || value.length === 0 ? "Task is required" : undefined),
    },
  });

  useEffect(() => {
    setValue("mood", []);
  }, []);

  return (
      <Form
          actions={
            <ActionPanel>
              <Action.SubmitForm title="Paste Intention" onSubmit={(data: IntentionForm) => handleSubmitForm(data, "paste")} />
              <Action.SubmitForm title="Copy to Clipboard" onSubmit={handleSubmit} />
            </ActionPanel>
          }
      >
        <Form.TextField title="Task" {...itemProps.task} placeholder="What do you want to do?" />
        <Form.TagPicker
            id="mood"
            title="Mood"
            value={values.mood}
            onChange={(newMood) => setValue("mood", newMood)}
            placeholder="Needed mindsets?"
        >
          {moods.map((mood) => (
              <Form.TagPicker.Item key={mood} value={mood} title={mood} />
          ))}
        </Form.TagPicker>
        <Form.TextField title="Reason" {...itemProps.reason} placeholder="Why are you doing it?" />
      </Form>
  );
}

async function handleSubmitForm(data: IntentionForm, action: "copy" | "paste") {
  const moodText = data.mood.join(", ");
  const intention = `I want to ${data.task}${moodText ? " with a mindset of " + moodText : ""}${data.reason ? " because " + data.reason : ""}: `;
  if (action === "paste") {
    Clipboard.paste(intention).then(() => showToast(Toast.Style.Success, "Intention pasted!"));
  } else if (action === "copy") {
    Clipboard.copy(intention).then(() => showToast(Toast.Style.Success, "Intention copied to clipboard!"));
  }
  await closeMainWindow({ popToRootType: PopToRootType.Immediate });
}
