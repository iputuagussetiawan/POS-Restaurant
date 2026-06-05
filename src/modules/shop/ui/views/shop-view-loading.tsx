export const ShopViewLoading = () => (
	<div className="flex min-h-screen flex-col">
		{/* Header skeleton */}
		<div className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 px-4 backdrop-blur-md md:px-6">
			<div className="mx-auto flex h-14 max-w-7xl items-center gap-4">
				<div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
				<div className="h-9 flex-1 animate-pulse rounded-full bg-gray-200" />
				<div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
			</div>
		</div>

		{/* Body */}
		<div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 md:px-6">
			{/* Sidebar skeleton — desktop only */}
			<aside className="hidden w-52 shrink-0 lg:block xl:w-60">
				<div className="rounded-xl border border-gray-100 bg-white p-4">
					<div className="mb-4 h-4 w-24 animate-pulse rounded bg-gray-200" />
					<div className="mb-3 h-8 animate-pulse rounded-lg bg-gray-100" />
					<div className="flex flex-col gap-2">
						{Array.from({ length: 6 }).map((_, i) => (
							<div
								key={i}
								className="h-[44px] animate-pulse rounded-xl bg-gray-100"
							/>
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

			{/* Main area */}
			<div className="flex min-w-0 flex-1 flex-col gap-4">
				{/* Sort bar skeleton */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="h-9 w-24 animate-pulse rounded-full bg-gray-200 lg:hidden" />
						<div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
					</div>
					<div className="h-9 w-48 animate-pulse rounded-lg bg-gray-200" />
				</div>

				{/* Grid skeleton */}
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
					{Array.from({ length: 12 }).map((_, i) => (
						<div
							key={i}
							className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
						>
							{/* Image */}
							<div className="aspect-[4/3] animate-pulse bg-gray-100" />
							{/* Body */}
							<div className="flex flex-col gap-3 p-3">
								{/* Name — 2 lines */}
								<div className="flex flex-col gap-1.5">
									<div className="h-3.5 w-full animate-pulse rounded bg-gray-100" />
									<div className="h-3.5 w-3/4 animate-pulse rounded bg-gray-100" />
								</div>
								{/* Price */}
								<div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
								{/* Base price */}
								<div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
								{/* Button */}
								<div className="h-8 w-full animate-pulse rounded-xl bg-gray-100" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	</div>
);
