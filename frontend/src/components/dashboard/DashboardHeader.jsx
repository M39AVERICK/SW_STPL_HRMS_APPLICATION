import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function DashboardHeader() {

    const { user } = useContext(AuthContext);

    const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    const hour = new Date().getHours();

    let greeting = "Good Evening";

    if(hour < 12){

        greeting = "Good Morning";

    }

    else if(hour < 17){

        greeting = "Good Afternoon";

    }

    return(

        <div className="bg-white rounded-2xl shadow p-6 flex justify-between items-center">

            <div>

                <h1 className="text-3xl font-bold">

                    {greeting}, {user?.name}

                </h1>

                <p className="text-gray-500 mt-1">

                    {today}

                </p>

                <p className="text-gray-400 mt-2">

                    Welcome back to STPL Human Resource Management System

                </p>

            </div>

            <div className="flex gap-5 text-2xl">

                🔔

                ⚙

                👤

            </div>

        </div>

    );

}

export default DashboardHeader;