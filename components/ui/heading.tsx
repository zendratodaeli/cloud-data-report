import { cn } from "@/lib/utils";
import { Montserrat } from "next/font/google";

interface HeadingProps {
  title: String,
  description: String
};

const montserrat = Montserrat({
  weight: "600",
  subsets: ["latin"],
});

export const Heading: React.FC<HeadingProps> = ({
  title, description
}) => {
  return(
    <div>
      <h2 className={cn(" text-2xl font-bold tracking-tight", montserrat.className)}>{title}</h2>
      <p className=" text-sm text-muted-foreground">{description}</p>
    </div>
  )
}