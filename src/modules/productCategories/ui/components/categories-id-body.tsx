import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CalendarIcon, HashIcon, PencilIcon, TrashIcon } from 'lucide-react';

interface Category {
	name: string;
	description?: string | null;
	imageUrl: string;
	slug: string;
	createdAt: Date | string;
	updatedAt: Date | string;
}

interface Props {
	data: Category;
	isRemoving: boolean;
	onEdit: () => void;
	onRemove: () => void;
}

export const CategoriesIdBody = ({ data, isRemoving, onEdit, onRemove }: Props) => (
	<div className="px-4 py-6 md:px-8">
		<div className="grid gap-8 lg:grid-cols-12">
			{/* Image */}
			<div className="lg:col-span-5">
				<div className="overflow-hidden rounded-xl border bg-white shadow-sm">
					<div className="relative aspect-square w-full">
						<Image
							src={data.imageUrl}
							alt={data.name}
							fill
							sizes="(max-width: 1024px) 100vw, 40vw"
							className="object-cover"
							priority
						/>
					</div>
				</div>
			</div>

			{/* Info */}
			<div className="flex flex-col gap-y-6 lg:col-span-7">
				<h1 className="text-2xl leading-tight font-bold tracking-tight capitalize md:text-3xl">
					{data.name}
				</h1>

				<Separator />

				{data.description ? (
					<div>
						<p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
							Description
						</p>
						<p className="text-base leading-relaxed text-foreground/80">
							{data.description}
						</p>
					</div>
				) : (
					<p className="text-sm text-muted-foreground/50 italic">
						No description provided.
					</p>
				)}

				<Separator />

				<dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
					<div>
						<dt className="mb-1 flex items-center gap-x-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
							<HashIcon className="size-3" /> Slug
						</dt>
						<dd className="inline-block rounded-md bg-muted px-2 py-1 font-mono text-sm">
							{data.slug}
						</dd>
					</div>
					<div>
						<dt className="mb-1 flex items-center gap-x-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
							<CalendarIcon className="size-3" /> Created
						</dt>
						<dd className="text-sm">
							{new Date(data.createdAt).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							})}
						</dd>
					</div>
					<div>
						<dt className="mb-1 flex items-center gap-x-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
							<CalendarIcon className="size-3" /> Last updated
						</dt>
						<dd className="text-sm">
							{new Date(data.updatedAt).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							})}
						</dd>
					</div>
				</dl>

				<Separator />

				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<Button onClick={onEdit} className="gap-x-2">
						<PencilIcon className="size-4" /> Edit category
					</Button>
					<Button
						variant="outline"
						onClick={onRemove}
						disabled={isRemoving}
						className="w-full gap-x-2 text-destructive hover:text-destructive sm:w-auto"
					>
						<TrashIcon className="size-4" /> Delete
					</Button>
				</div>
			</div>
		</div>
	</div>
);
