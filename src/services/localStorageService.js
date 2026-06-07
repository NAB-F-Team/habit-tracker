export const loadState = () => {

    try {

        const state =
            localStorage.getItem("habitTracker");

        return state
            ? JSON.parse(state)
            : undefined;

    }
    catch {
        return undefined;
    }

};

export const saveState = (state) => {

    try {

        localStorage.setItem(
            "habitTracker",
            JSON.stringify(state)
        );

    } catch (error) {

        console.log(error);

    }

};