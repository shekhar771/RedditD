"use client";

import Link from "next/link";
import React from "react";
import reddie from "../../../public/reddie-logo.svg";
import Image from "next/image";
import { ModeToggle } from "./ThemeButton";
import { Button } from "@/components/ui/button";
type Props = {};

const Navbar = (props: Props) => {
  return (
    <nav className="flex h-[10vh] w-full items-center border-b px-7 mx-2 md:justify-between px-14">
      <Link href="/">
        <Image src={reddie} alt="reddit logo" className="  h-14 w-full" />
      </Link>
      <div className="flex items-center gap-x-2">
        <ModeToggle />
        <Button variant={"secondary"}>sign in</Button>
        <Button>sign up</Button>
      </div>
    </nav>
  );
};

export default Navbar;
