import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input.js";
import { Switch } from "./Switch.js";

const meta: Meta = { title: "Components/Forms" };
export default meta;
type Story = StoryObj;

export const TextInput: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 260 }}>
      <Input placeholder="Email address" />
      <Input placeholder="Disabled" disabled />
    </div>
  ),
};

export const Toggle: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Switch defaultChecked />
      <Switch />
      <Switch disabled />
    </div>
  ),
};
