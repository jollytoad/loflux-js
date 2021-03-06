/// <reference path="../../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../../loflux/src/locker.ts" />
/// <reference path="../../../loflux/src/round.ts" />
/// <reference path="../src/state.ts" />
/// <reference path="../src/actions.ts" />

describe("actions", () => {

    var state: app.State;
    var todos: app.Todo[];
    var actions: app.Actions;


    function given(modifyState?: (s: app.State) => void) {
        var initState = app.defaultState();

        if (modifyState) {
            modifyState(initState);
        }

        // The state locker
        var locker:LoFlux.Locker<app.State> = LoFlux.createLocker(Utils.deepFreeze(initState));

        function spectator(newState: app.State) {
            state = newState;
            todos = state.todos;
        }

        actions = app.createActions(LoFlux.round.bind(undefined, locker, spectator));
    }

    function todo(title: string, completed:boolean = false): app.Todo {
        return {
            id: title,
            title: title,
            completed: completed
        };
    }

    beforeEach(() => {
        state = null;
        todos = null;
        actions = null;
    });

    describe("editNewTodo", () => {

        it("sets addText", () => {
            given();

            actions.editNewTodo("Stuff");

            expect(state.addText).toBe("Stuff");
        });

    });

    describe("addTodo", () => {

        it("adds a todo to an empty todo list", () => {
            given();

            actions.addTodo("Only Todo");

            expect(todos.length).toBe(1);
            expect(todos[0].id).toBeDefined();
            expect(todos[0].title).toBe("Only Todo");
            expect(todos[0].completed).toBe(false);
        });

        it("adds a todo to the end of a populated todo list", () => {
            given((state: app.State) => {
                state.todos = [ todo("Here"), todo("There") ];
            });

            actions.addTodo("Everywhere");

            expect(todos.length).toBe(3);
            expect(todos[2].title).toBe("Everywhere");
        });

        it("clears addText in state", () => {
            given((state: app.State) => {
                state.addText = "Something";
            });

            actions.addTodo("Everywhere");

            expect(state.addText).toBeFalsy();
        });
    });

    describe("toggleAll", () => {

        it("can set completed of all todos to true", () => {
            given((state: app.State) => {
                state.todos = [ todo("Here",true), todo("There",false) ];
            });

            actions.toggleAll(true);

            expect(todos[0].completed).toBe(true);
            expect(todos[1].completed).toBe(true);
        });

        it("can set completed of all todos to false", () => {
            given((state: app.State) => {
                state.todos = [ todo("Here",true), todo("There",false) ];
            });

            actions.toggleAll(false);

            expect(todos[0].completed).toBe(false);
            expect(todos[1].completed).toBe(false);
        });
    });

    describe("toggle", () => {

        it("will set completed false to true", () => {
            given((state: app.State) => {
                state.todos = [ todo("Here",false) ];
            });

            actions.toggle("Here");

            expect(todos[0].completed).toBe(true);
        });

        it("will set completed true to false", () => {
            given((state: app.State) => {
                state.todos = [ todo("Here",true) ];
            });

            actions.toggle("Here");

            expect(todos[0].completed).toBe(false);
        });
    });

    describe("destroy", () => {

        it("will remove the todo with the given id", () => {
            given((state: app.State) => {
                state.todos = [ todo("Here"), todo("Remove"), todo("There") ];
            });

            actions.destroy("Remove");

            expect(todos.length).toBe(2);
            expect(todos[0].title).toBe("Here");
            expect(todos[1].title).toBe("There");
        });
    });

    describe("clearCompleted", () => {

        it("will remove completed todos only", () => {
            given((state: app.State) => {
                state.todos = [ todo("Here",true), todo("There",false), todo("More",true) ];
            });

            actions.clearCompleted();

            expect(todos.length).toBe(1);
            expect(todos[0].title).toBe("There");
        });

    });

    describe("editTodo", () => {

        it("will set editing and editText", () => {
            given((state: app.State) => {
                state.todos = [ todo("Here") ];
            });

            actions.editTodo("Here", "There");

            expect(state.editing).toBe("Here");
            expect(state.editText).toBe("There");
        });
    });

    describe("cancel", () => {

        it("will reset editing and editText to null", () => {
            given((state: app.State) => {
                state.editing = "Here";
                state.editText = "There";
                state.todos = [ todo("Here") ];
            });

            actions.cancel();

            expect(state.editing).toBeNull();
            expect(state.editText).toBeNull();
        });
    });

    describe("save", () => {

        it("will update the todo and reset editing and editText to null", () => {
            given((state: app.State) => {
                state.editing = "Here";
                state.editText = "There";
                state.todos = [ todo("Here") ];
            });

            actions.save("Here", "There");

            expect(todos[0].id).toBe("Here");
            expect(todos[0].title).toBe("There");
            expect(state.editing).toBeNull();
            expect(state.editText).toBeNull();
        });
    });

});
