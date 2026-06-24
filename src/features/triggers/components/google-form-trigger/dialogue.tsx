"use client";

import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateGoogleFormScript } from "./utils";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const GoogleFormTriggerDialog = ({ open, onOpenChange }: Props) => {
    const params = useParams();
    const workflowId = params.workflowId as string;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webHookUrl = `${baseUrl}/api/webhooks/google-form?workflowId=${workflowId}`;
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(webHookUrl);
            toast.success("Webhook URL copied to clipboard");
        } catch {
            toast.error("Failed to copy URL");
        }
    };

    const copyScript = async () => {
        const script = generateGoogleFormScript(webHookUrl)
        try {
            await navigator.clipboard.writeText(script);
            toast.success("Script copied to clipboard");
        } catch {
            toast.error("Failed to copy script");
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Google form Trigger Configuration</DialogTitle>
                    <DialogDescription>
                        Use this webhook URL in your Google Form's Apps Script to trigger
                        this workflow when a form is submitted.
                    </DialogDescription>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="webhook-url">Webhook URL</Label>
                            <div className="flex gap-2">
                                <Input id="webhook-url" value={webHookUrl} readOnly className="font-mono text-sm" />
                                <Button
                                    variant="outline"
                                    type="button"
                                    size="icon"
                                    onClick={copyToClipboard}
                                >
                                    <CopyIcon />
                                </Button>
                            </div>
                        </div>
                        <div className="rounded-lg bg-muted p-4 space-y-2">
                            <h4 className="font-medium text-sm">Setup instructions</h4>
                            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                                <li>Open your Google form</li>
                                <li>Click the three dots menu → Apps Script</li>
                                <li>Copy and paste the script below</li>
                                <li>Replace WEBHOOK_URL with your webhook URL above</li>
                                <li>Save and click "triggers" → Add Trigger</li>
                                <li>Choose From form → On for submit → Save</li>
                            </ol>
                        </div>
                        <div className="rounded-lg bg-muted p-4 space-y-3">
                            <h4 className="font-medium text-sm">Google Apps Script:</h4>
                            <Button type="button" variant={"outline"} onClick={copyScript}>
                                <CopyIcon className="size-4 mr-2" />
                                Copy Google Apps Script
                            </Button>
                            <p className="text-xm text-muted-foreground">This script includes your webhook URL and handles for submission</p>
                        </div>
                        <div className="rounded-lg bg-muted p-4 space-y-2">
                            <h4 className="font-medium text-sm">Available variables</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>
                                    <code className="bg-background px-1 py-0.5 rounded">
                                        {"{{googleForm.respondentEmail}}"}
                                    </code>
                                    - Respondent's Email
                                </li>
                                <li>
                                    <code className="bg-background px-1 py-0.5 rounded">
                                        {"{{googleForm.responses['Question Name']}}"}
                                    </code>
                                    - Specific answer
                                </li>
                                <li>
                                    <code className="bg-background px-1 py-0.5 rounded">
                                        {"{{json googleForm.responses}}"}
                                    </code>
                                    - All responses as JSON
                                </li>
                            </ul>
                        </div>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};
