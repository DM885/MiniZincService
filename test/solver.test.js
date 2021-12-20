/*import {beforeEach, describe, expect, it, jest} from '@jest/globals';
import Solver from '../src/Solver.js'
import {solverID} from '../src/index.js';



describe('A solver class', () => {
    let solver;

    beforeEach(async() =>{

    })

    it("aaaaaaaaaaaaaaaaaaaaaaaa", async () => {

        const msg = {solverID: solverID, problemID: 1, model: "model.mzn", data: "data.dzn",
                    solver: false, flagS: false, flagF: false, cpuLimit: 5, memoryLimit: 100};

        const buildCommand = jest.spyOn(Solver.prototype, '#buildCommand');
        buildCommand.mockImplementation(() => {});

        solver = new Solver(msg.problemID, "model.mzn", "data.dzn", msg.solver, msg.flagS, msg.flagF, msg.cpuLimit, msg.memoryLimit, msg.timeLimit, msg.dockerImage);

        solver.buildCommand()
        //Expect that the database has been queried. 
        expect(buildCommand).toHaveBeenCalledTimes(1);
    });
})
*/

// let test = new Solver("42", "prod-planning.dzn", "prod-planning.mzn");
// test.onFinish = data => {
//     console.log("Sap", data);
// };
test('can pass', () => {
    expect(true).toBe(true);
});