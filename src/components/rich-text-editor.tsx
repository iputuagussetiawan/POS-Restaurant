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
	StrikethroughIcon,
	ListIcon,
	ListOrderedIcon,
	AlignLeftIcon,
	AlignCenterIcon,
	AlignRightIcon,
	Heading2Icon,
	Heading3Icon,
	QuoteIcon,
} from 'lucide-react';

interface RichTextEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

const ToolbarButton = ({
	onClick,
	active,
	title,
	children,
}: {
	onClick: () => void;
	active?: boolean;
	title: string;
	children: React.ReactNode;
}) => (
	<button
		type="button"
		title={title}
		onMouseDown={(e) => {
			e.preventDefault();
			onClick();
		}}
		className={cn(
			'flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
			active && 'bg-primary/10 text-primary'
		)}
	>
		{children}
	</button>
);

const Divider = () => <div className="mx-1 h-5 w-px shrink-0 bg-border" />;

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
			attributes: { class: 'tiptap' },
		},
	});

	if (!editor) return null;

	return (
		<div className={cn('overflow-hidden rounded-md border bg-white', className)}>
			{/* toolbar */}
			<div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/20 px-2 py-1.5">
				{/* text style */}
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
				<ToolbarButton
					title="Strikethrough"
					onClick={() => editor.chain().focus().toggleStrike().run()}
					active={editor.isActive('strike')}
				>
					<StrikethroughIcon className="size-3.5" />
				</ToolbarButton>

				<Divider />

				{/* headings */}
				<ToolbarButton
					title="Heading 2"
					onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
					active={editor.isActive('heading', { level: 2 })}
				>
					<Heading2Icon className="size-3.5" />
				</ToolbarButton>
				<ToolbarButton
					title="Heading 3"
					onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
					active={editor.isActive('heading', { level: 3 })}
				>
					<Heading3Icon className="size-3.5" />
				</ToolbarButton>
				<ToolbarButton
					title="Blockquote"
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
					active={editor.isActive('blockquote')}
				>
					<QuoteIcon className="size-3.5" />
				</ToolbarButton>

				<Divider />

				{/* lists */}
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

				<Divider />

				{/* alignment */}
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

			<EditorContent editor={editor} />
		</div>
	);
};

export default RichTextEditor;
