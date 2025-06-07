import React from 'react';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { ChevronRightIcon, MoreVerticalIcon, PencilIcon, TrashIcon } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
interface Props {
	agentId: string;
	agentName: string;
	onEdit: () => void;
	onRemove: () => void;
}

const AgentIdViewHeader = ({ agentId, agentName, onEdit, onRemove }: Props) => {
	return (
		<div className="flex items-center justify-between">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink
							asChild
							className="text-sm font-medium text-muted-foreground"
						>
							<Link href={'/agents'}>My Agents</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator className="[&>svg:size-4] text-sm font-medium text-foreground">
						<ChevronRightIcon />
					</BreadcrumbSeparator>
					<BreadcrumbItem>
						<BreadcrumbLink asChild className="text-sm font-medium text-foreground">
							<Link href={`/agents/${agentId}`}>{agentName}</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<Button variant={'ghost'} size={'sm'}>
						<MoreVerticalIcon className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={onEdit}>
						<PencilIcon className="mr-2 h-4 w-4" /> Edit
					</DropdownMenuItem>
					<DropdownMenuItem onClick={onRemove}>
						<TrashIcon className="mr-2 h-4 w-4" /> Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export default AgentIdViewHeader;
