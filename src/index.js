import fs from "fs";
import uid from "uid-safe";
import rapid from "@ovcina/rapidriver";

import {host, subscriber} from "./helpers.js";
import Solver from "./Solver.js";

export let solverID = process.env?.riverId ?? uid.sync(18);

let queue = [];
let solver = false; // Not busy

// TODO: Add job queue,

/*
    Expected input:
    {
        problemID: string,
        data: string,
        model: string,
        solver: string|false,
        flagS: boolean,
        flagF: boolean,
    }
*/
export async function solve(msg, publish){
    if(solver || msg.solverID !== solverID) // Solver is busy
    {
        if(msg.solverID === solverID && solver) // Its already busy, but the task has been assigned to it.
        {
            queue.push(msg);
        }
        return;
    }
    solver = true; // Busy while were writing to disk

    fs.writeFileSync("model.mzn", msg.model);
    fs.writeFileSync("data.dzn", msg.data);

    solver = new Solver(msg.problemID, "model.mzn", "data.dzn", msg.solver, msg.flagS, msg.flagF, msg.cpuLimit, msg.memoryLimit, msg.timeLimit, msg.dockerImage, data => {
        if(data && data[data.length - 1].optimal) // Solver found optimal
        {
            publish("stopSolve", { // Stop other solvers working on this problem
                problemID: msg.problemID
            });
        }
        solver = false;
        publish("solver-response", {
            problemID: msg.problemID,
            solverID,
            data,
            busy: queue.length > 0,
        });

        if(queue.length > 0)
        {
            solve(queue.shift(), publish);
        }
    });

    publish("solver-pong-response", { // Tell our JobQueues that this solver is busy.
        solverID,
        problemID: msg.problemID
    });
}

export async function stopSolve(msg, publish){
    if(!solver || solver.id !== msg.problemID) // This isnt for this solver
    {
        return;
    }

    solver.stop();
    solver = false;

    publish("solver-pong-response", {
        solverID,
        problemID: solver?.problemID ?? -1
    });
}

export async function ping(msg, publish){
    if(msg.solverID && msg.solverID !== solverID) // This isnt for this solver
    {
        return;
    }

    publish("solver-pong-response", {
        solverID,
        problemID: solver?.problemID ?? -1
    });
}

if(process.env.RAPID)
{
    subscriber(host, [
        {river: "solver-" + solverID, event: "solve", work: solve},
        {river: "solver-" + solverID, event: "stopSolve", work: stopSolve},
        {river: "solver-" + solverID, event: "solver-ping", work: ping},
    ]);

    setTimeout(async () => {
      rapid.publish(host, "solver-pong-response", {
        solverID,
        problemID: solver?.problemID ?? -1,
        respond: true,
      })
    }, 1500); // Tell job-queue about us
}
