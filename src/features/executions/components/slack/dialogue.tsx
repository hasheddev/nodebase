"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";


const formSchema = z.object({
    variableName: z
        .string()
        .min(1, { message: "Variable name is required" })
        .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
            message:
                "Variable name must start with letters or underscores and must contain only letters, numbers or underscores",
        }),
    content: z.string().min(2, "Message content is required").max(2000, 'Discord messages cannot exceed 2000 characters'),
    webhookUrl: z.string().min(2, "Webhook URL is required")
});

export type SlackFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (value: SlackFormValues) => void;
    defaultValues?: Partial<SlackFormValues>;
}

export const SlackDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {
    const form = useForm<SlackFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: defaultValues.content || "",
            variableName: defaultValues.variableName || "",
            webhookUrl: defaultValues.webhookUrl || ""
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                content: defaultValues.content || "",
                variableName: defaultValues.variableName || "",
                webhookUrl: defaultValues.webhookUrl || ""
            });
        }
    }, [open, defaultValues, form]);

    const watchVariableName = form.watch("variableName") || "variableName";

    const handleSubmit = (values: SlackFormValues) => {
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-full max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Slack</DialogTitle>
                    <DialogDescription>Configure the Slack webhook setting for this node.</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="flex flex-col flex-1 min-h-0"
                    >
                        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-6">
                            <FormField
                                control={form.control}
                                name={"variableName"}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Variable Name</FormLabel>
                                        <FormControl className="w-full">
                                            <Input placeholder="variableName" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Use this name to reference the result in other nodes:{" "}
                                            {`{{${watchVariableName}.slackMessageSent}}`}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={"webhookUrl"}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Webhook URL</FormLabel>
                                        <FormControl className="w-full">
                                            <Input placeholder="https://hooks.slack.com/services/.." {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Get this from Slack: Workspace Settings  → Tools  → Workflows  → Webhooks
                                        </FormDescription>
                                        <FormDescription>
                                            Make sure the variable name set as "content"
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Message Content</FormLabel>
                                        <FormControl className="w-full">
                                            <Textarea
                                                {...field}
                                                placeholder="Summary: {{myAi.text}}"
                                                className="min-h-[120px] font-mono text-sm"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            The Message to send. Use {"{{variables}}"} for
                                            simple values or {"{{json variables}}"} to stringify
                                            objects
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="p-6 pt-4 border-t bg-muted/30">
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
