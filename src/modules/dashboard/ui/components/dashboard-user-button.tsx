import GenerateAvatar from '@/components/generate-avatar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { authClient } from '@/lib/auth-client';
import { ChevronDownIcon, CreditCardIcon, LogOutIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

const DashboardUserButton = () => {
    const isMobile = useIsMobile();
    const router = useRouter();
    const { data, isPending } = authClient.useSession();
    if (isPending || !data?.user) {
        return null;
    }

    const onLogout = () => {
        authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push('/sign-in');
                },
            },
        });
    };

    if (isMobile) {
        return (
            <Drawer>
                <DrawerTrigger className="flex w-full items-center justify-between gap-x-2 overflow-hidden rounded-lg border border-border/10 bg-white/5 p-3 hover:bg-white/10">
                    {data.user.image ? (
                        <Avatar>
                            <AvatarImage src={data.user.image} />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    ) : (
                        <GenerateAvatar
                            seed={data.user.name}
                            variant="initials"
                            className="mr-3 size-9"
                        />
                    )}
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden text-left">
                        <p className="w-full truncate text-sm">{data.user.name}</p>
                        <p className="w-full truncate text-xs">{data.user.email}</p>
                    </div>
                    <ChevronDownIcon className="size-4 shrink-0" />
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{data.user.name}</DrawerTitle>
                        <DrawerDescription>{data.user.email}</DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                        <Button variant="outline" onClick={() => {}}>
                            <CreditCardIcon className="size-4 text-black" />
                            <span>Billing</span>
                        </Button>

                        <Button variant="outline" onClick={onLogout}>
                            <LogOutIcon className="size-4 text-black" />
                            <span>Logout</span>
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
            // <Drawer>
            //   <DrawerTrigger
            //     asChild
            //     className="rounded-lg gap-x-2 border border-border/10 p-3 w-full flex items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden"
            //   >
            //     {data.user.image ? (
            //       <Avatar>
            //         <AvatarImage src={data.user.image} />
            //         <AvatarFallback>CN</AvatarFallback>
            //       </Avatar>
            //     ) : (
            //       <GenerateAvatar
            //         seed={data.user.name}
            //         variant="initials"
            //         className="size-9 mr-3"
            //       />
            //     )}
            //     <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
            //       <p className="text-sm truncate w-full">{data.user.name}</p>
            //       <p className="text-xs truncate w-full">{data.user.email}</p>
            //     </div>
            //     <ChevronDownIcon className="size-4 shrink-0" />
            //   </DrawerTrigger>
            //   <DrawerContent>
            //     <DrawerHeader>
            //       <DrawerTitle>{data.user.name}</DrawerTitle>
            //       <DrawerDescription>{data.user.email}</DrawerDescription>
            //     </DrawerHeader>
            //     <DrawerFooter>
            //       <Button
            //         variant="outline"
            //         onClick={()=>{}}
            //       >
            //         <CreditCardIcon className="size-4 text-black" />
            //         <span>Billing</span>
            //       </Button>

            //       <Button
            //         variant="outline"
            //         onClick={onLogout}
            //       >
            //         <LogOutIcon className="size-4 text-black" />
            //         <span>Logout</span>
            //       </Button>
            //     </DrawerFooter>
            //   </DrawerContent>
            // </Drawer>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center justify-between gap-x-2 overflow-hidden rounded-lg border border-border/10 bg-white/5 p-3 hover:bg-white/10">
                {data.user.image ? (
                    <Avatar>
                        <AvatarImage src={data.user.image} />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                ) : (
                    <GenerateAvatar
                        seed={data.user.name}
                        variant="initials"
                        className="mr-3 size-9"
                    />
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden text-left">
                    <p className="w-full truncate text-sm">{data.user.name}</p>
                    <p className="w-full truncate text-xs">{data.user.email}</p>
                </div>
                <ChevronDownIcon className="size-4 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right" className="w-72">
                <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                        <span className="truncate font-medium">{data.user.name}</span>
                        <span className="truncate text-sm font-normal text-muted-foreground">
                            {data.user.email}
                        </span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex cursor-pointer items-center justify-between">
                    Billing
                    <CreditCardIcon className="size-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={onLogout}
                    className="flex cursor-pointer items-center justify-between"
                >
                    Logout
                    <LogOutIcon className="size-4" />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default DashboardUserButton;
