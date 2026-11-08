export type {
    AvatarProps,
    AvatarImageProps,
    AvatarPlaceholderProps,
    AvatarGroupProps,
    AvatarStatus,
    ImageLoadingStatus,
    AvatarSize,
} from "./avatar";

import { Avatar, AvatarImage, AvatarPlaceholder, AvatarGroup } from "./avatar";
export { Avatar, AvatarImage, AvatarPlaceholder, AvatarGroup };

type CompoundAvatar = typeof Avatar & {
    Image: typeof AvatarImage;
    Placeholder: typeof AvatarPlaceholder;
    Group: typeof AvatarGroup;
};

const AvatarCompound = Object.assign(Avatar, {
    Image: AvatarImage,
    Placeholder: AvatarPlaceholder,
    Group: AvatarGroup,
}) satisfies CompoundAvatar;

export default AvatarCompound;
