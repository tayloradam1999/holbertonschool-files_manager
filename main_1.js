import dbClient from './utils/db';

const waitConnection = () => {
    return new Promise((resolve, reject) => {
        let i = 0;
        const repeatFct = async () => {
            await setTimeout(() => {
                i += 1;
		console.log('This is i', );
                if (i >= 10) {
		    console.log('This is a test');
                    reject()
		    console.log('Rejected');
                }
                else if(!dbClient.isAlive()) {
                    repeatFct()
                }
                else {
		    console.log('This is a test');
                    resolve()
                }
            }, 1000);
        };
        repeatFct();
    })
};

(async () => {
    console.log(dbClient.isAlive());
    await waitConnection();
    console.log(dbClient.isAlive());
    console.log(await dbClient.nbUsers());
    console.log(await dbClient.nbFiles());
})();
