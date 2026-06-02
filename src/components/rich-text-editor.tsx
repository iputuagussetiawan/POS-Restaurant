'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';
import {
	BoldIcon,
	ItalicIcon,
	UnderlineIcon,
	ListIcon,
	ListOrderedIcon,
	AlignLeftIcon,
	AlignCenterIcon,
	AlignRightIcon,
	Heading2Icon,
} from 'lucide-react';

interface RichTextEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

interface ToolbarButtonProps {
	onClick: () => void;
	active?: boolean;
	title: string;
	children: React.ReactNode;
}

const ToolbarButton = ({ onClick, active, title, children }: ToolbarButtonProps) => (
	<button
		type="button"
		title={title}
		onMouseDown={(e) => {
			e.preventDefault();
			onClick();
		}}
		className={cn(
			'flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
			active && 'bg-muted text-foreground'
		)}
	>
		{children}
	</button>
);

const RichTextEditor = ({
	value,
	onChange,
	placeholder = 'Write a description...',
	className,
}: RichTextEditorProps) => {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Underline,
			TextAlign.configure({ types: ['heading', 'paragraph'] }),
			Placeholder.configure({ placeholder }),
		],
		content: value,
		onUpdate: ({ editor }) => {
			const html = editor.getHTML();
			onChange(html === '<p></p>' ? '' : html);
		},
		editorProps: {
			attributes: {
				class: 'min-h-[100px] px-3 py-2 text-sm outline-none',
			},
		},
	});

	if (!editor) return null;

	return (
		<div className={cn('overflow-hidden rounded-md border bg-white', className)}>
			{/* toolbar */}
			<div className="flex flex-wrap items-center gap-x-0.5 border-b bg-muted/30 px-2 py-1.5">
				<ToolbarButton
					title="Bold"
					onClick={() => editor.chain().focus().toggleBold().run()}
					active={editor.isActive('bold')}
				>
					<BoldIcon className="size-3.5" />
				</ToolbarButton>

				<ToolbarButton
					title="Italic"
					onClick={() => editor.chain().focus().toggleItalic().run()}
					active={editor.isActive('italic')}
				>
					<ItalicIcon className="size-3.5" />
				</ToolbarButton>

				<ToolbarButton
					title="Underline"
					onClick={() => editor.chain().focus().toggleUnderline().run()}
					active={editor.isActive('underline')}
				>
					<UnderlineIcon className="size-3.5" />
				</ToolbarButton>

				<div className="mx-1.5 h-4 w-px bg-border" />

				<ToolbarButton
					title="Heading"
					onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
					active={editor.isActive('heading', { level: 2 })}
				>
					<Heading2Icon className="size-3.5" />
				</ToolbarButton>

				<ToolbarButton
					title="Bullet list"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					active={editor.isActive('bulletList')}
				>
					<ListIcon className="size-3.5" />
				</ToolbarButton>

				<ToolbarButton
					title="Ordered list"
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					active={editor.isActive('orderedList')}
				>
					<ListOrderedIcon className="size-3.5" />
				</ToolbarButton>

				<div className="mx-1.5 h-4 w-px bg-border" />

				<ToolbarButton
					title="Align left"
					onClick={() => editor.chain().focus().setTextAlign('left').run()}
					active={editor.isActive({ textAlign: 'left' })}
				>
					<AlignLeftIcon className="size-3.5" />
				</ToolbarButton>

				<ToolbarButton
					title="Align center"
					onClick={() => editor.chain().focus().setTextAlign('center').run()}
					active={editor.isActive({ textAlign: 'center' })}
				>
					<AlignCenterIcon className="size-3.5" />
				</ToolbarButton>

				<ToolbarButton
					title="Align right"
					onClick={() => editor.chain().focus().setTextAlign('right').run()}
					active={editor.isActive({ textAlign: 'right' })}
				>
					<AlignRightIcon className="size-3.5" />
				</ToolbarButton>
			</div>

			{/* editor area */}
			<EditorContent editor={editor} />
		</div>
	);
};

export default RichTextEditor;
