import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendConnectionRequest } from "@/data/sendConnectionRequest";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { connectionRequestSchema } from "@/lib/validation";

const formSchema = connectionRequestSchema;

type FormData = z.infer<typeof formSchema>;

export function SendConnectionRequest() {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			recipientEmail: "",
		},
	});

	const onSubmit = async (data: FormData) => {
		setIsSubmitting(true);
		try {
			await sendConnectionRequest({ data });
			showSuccessToast("Connection request sent successfully");
			form.reset();
		} catch (error) {
			showErrorToast(
				"Failed to send connection request",
				error instanceof Error ? error.message : "Unknown error",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<UserPlusIcon className="w-5 h-5" />
					Send Connection Request
				</CardTitle>
				<CardDescription>
					Connect with other users to view shared transactions
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="recipientEmail">Email Address</Label>
						<Input
							id="recipientEmail"
							type="email"
							{...form.register("recipientEmail")}
							placeholder="Enter email address"
						/>
						{form.formState.errors.recipientEmail && (
							<p className="text-sm text-destructive">
								{form.formState.errors.recipientEmail.message}
							</p>
						)}
					</div>
					<Button type="submit" disabled={isSubmitting} className="w-full">
						{isSubmitting ? "Sending..." : "Send Request"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
