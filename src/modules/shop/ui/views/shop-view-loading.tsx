export const ShopViewLoading = () => (
	<div className="flex min-h-screen flex-col">
		{/* Toolbar skeleton */}
		<div className="sticky top-14 z-20 border-b bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md md:px-6">
			<div className="mx-auto flex max-w-7xl items-center gap-3">
				<div className="h-9 w-24 animate-pulse rounded-full bg-gray-200 lg:hidden" />
				<div className="h-9 flex-1 animate-pulse rounded-full bg-gray-200" />
			</div>
		</div>

		{/* Body skeleton */}
		<div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 md:px-6">
			{/* Sidebar skeleton — desktop only */}
			<aside className="hidden w-56 shrink-0 lg:block xl:w-64">
				<div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
					<div className="mb-4 h-4 w-24 animate-pulse rounded bg-gray-200" />
					<div className="flex flex-col gap-2">
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={i} className="h-10 animate-pulse rounded-xl bg-gray-100" />
						))}
					</div>
					<div className="my-5 h-px bg-gray-100" />
					<div className="mb-4 h-4 w-20 animate-pulse rounded bg-gray-200" />
					<div className="flex gap-2">
						<div className="h-9 flex-1 animate-pulse rounded-lg bg-gray-100" />
						<div className="h-9 flex-1 animate-pulse rounded-lg bg-gray-100" />
					</div>
				</div>
			</aside>

			{/* Grid skeleton */}
			<div className="min-w-0 flex-1">
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<div
							key={i}
							className="aspect-[3/4] animate-pulse rounded-2xl bg-gray-200"
						/>
					))}
				</div>
			</div>
		</div>
	</div>
);
