import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./Card.js";
import { Button } from "./Button.js";

const meta: Meta = { title: "Components/Data Display" };
export default meta;
type Story = StoryObj;

export const Badges: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Badge variant="solid">Solid</Badge>
      <Badge variant="soft">Soft</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

export const BasicCard: Story = {
  render: () => (
    <Card style={{ width: 320 }}>
      <CardHeader>
        <CardTitle>Season pass</CardTitle>
        <CardDescription>Renews every 30 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Badge variant="soft">Active</Badge>
          <Button size="sm" variant="soft">
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  ),
};
