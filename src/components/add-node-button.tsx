"use client";

import { PlusIcon } from "lucide-react";
import { memo, useState } from "react";
import { NodeSelector } from "./node-selector";
import { Button } from "./ui/button";

export const AddNodeButton = memo(() => {
    const [open, setOpen] = useState(false);
    return (
        <NodeSelector open={open} onOpenChange={setOpen}>
            <Button
                onClick={() => setOpen(true)}
                size={"icon"}
                variant={"outline"}
                className="bg-background"
            >
                <PlusIcon />
            </Button>
        </NodeSelector>
    );
});

AddNodeButton.displayName = "AddNodeButton";
