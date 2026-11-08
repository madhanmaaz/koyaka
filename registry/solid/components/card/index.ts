export type {
    CardProps,
    CardHeaderProps,
    CardContentProps,
    CardFooterProps,
    CardMediaProps,
    CardVariant,
} from "./card";

import { Card, CardHeader, CardContent, CardFooter, CardMedia } from "./card";
export { Card, CardHeader, CardContent, CardFooter, CardMedia };

type CompoundCard = typeof Card & {
    Header: typeof CardHeader;
    Content: typeof CardContent;
    Footer: typeof CardFooter;
    Media: typeof CardMedia;
};

const CardCompound = Object.assign(Card, {
    Header: CardHeader,
    Content: CardContent,
    Footer: CardFooter,
    Media: CardMedia,
}) satisfies CompoundCard;

export default CardCompound;
