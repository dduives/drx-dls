import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button.js";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./Dialog.js";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "./Tabs.js";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "./Tooltip.js";

const meta: Meta = { title: "Components/Overlays" };
export default meta;
type Story = StoryObj;

export const DialogExample: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete profile</DialogTitle>
          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Delete</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  ),
};

export const TabsExample: Story = {
  render: () => (
    <Tabs defaultValue="movies" style={{ width: 360 }}>
      <TabsList>
        <TabsTrigger value="movies">Movies</TabsTrigger>
        <TabsTrigger value="shows">Shows</TabsTrigger>
        <TabsTrigger value="live">Live</TabsTrigger>
      </TabsList>
      <TabsContent value="movies">Movie catalog</TabsContent>
      <TabsContent value="shows">Show catalog</TabsContent>
      <TabsContent value="live">Live channels</TabsContent>
    </Tabs>
  ),
};

export const TooltipExample: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Tokens flow through here too</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
