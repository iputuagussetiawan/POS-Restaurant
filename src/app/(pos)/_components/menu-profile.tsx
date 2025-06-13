import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, LogOutIcon, User2 } from 'lucide-react';
import React from 'react';

const MenuProfile = () => {
	return (
		<div>
			<DropdownMenu>
				<DropdownMenuTrigger className='flex items-center gap-2'>
                    <div className='flex items-center'>
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <span className='ml-2 text-sm capitalize text-gray-700'>
                            John Doe
                        </span>
                        <ChevronDown className='h-4 w-4' />
                    </div>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end' className='w-[180px] shadow'>
					<DropdownMenuLabel className='py-2 text-center'>My Account</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem className='py-2'>
                        <User2 className='mr-2 h-4 w-4' />
                        Profile
                    </DropdownMenuItem>
					<DropdownMenuItem className='py-2'>
                        <LogOutIcon className='mr-2 h-4 w-4' />
                        Logout
                    </DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export default MenuProfile;
