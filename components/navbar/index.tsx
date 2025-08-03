import React from "react";
import Link from "next/link";
import Logo from "./Logo";

const Navbar = () => {
  return (
    <>
      <div className="w-full h-20 bg-emerald-800 sticky top-0">
        <div className="container mx-auto px-4 h-full">
          <div className="flex justify-between items-center h-full">
            <Logo />
            <ul className="hidden md:flex gap-x-6 text-white ">
              <li>
                <Link href="/products">
                  <p>Products</p>
                </Link>
              </li>
              <li>
                <Link href="/customers">
                  <p>Customers</p>
                </Link>
              </li>
              <li>
                <Link href="/expenses">
                  <p>Expenses</p>
                </Link>
              </li>
              <li>
                <Link href="/reports">
                  <p>Reports</p>
                </Link>
              </li>
            </ul>
            <div className="hidden md:block">
              <div className="h-12 rounded-lg bg-white font-bold px-5 flex items-center">
                <Link href="/sign-in">
                  <p>Sign In</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
