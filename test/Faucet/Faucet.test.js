const { expect } = require("chai");

describe("Faucet Smart Contract",async  function () {
    let faucet;
    let zeroToken;
    let oneToken;

    [deployer, admin, user1, user2, newAdmnin] = await ethers.getSigners()

    async function deployFaucet() {
        const maxFaucetAmount = ethers.parseEther("50")
        const Faucet = await hre.ethers.getContractFactory("Faucet");
        faucet = await Faucet.deploy(admin.address, maxFaucetAmount)
    }

    async function deployZeroToken() {
        const ZeroToken = await hre.ethers.getContractFactory("ZeroToken");
        zeroToken = await ZeroToken.deploy(admin.address)
    }


    async function deployOneToken() {
        const OneToken = await hre.ethers.getContractFactory("OneToken");
        oneToken = await OneToken.deploy(admin.address)
    }


    beforeEach(async function () {
        await deployZeroToken()
        await deployOneToken()
        await deployFaucet();
    });

    describe("Check contract configurations", function () {

        it("Should have correct admin", async function () {
            const getAdminRole = await faucet.DEFAULT_ADMIN_ROLE()
            const hasAdminRole = await faucet.hasRole(getAdminRole,admin.address);
            expect(hasAdminRole).is.true;
        });

        it("Deployer shouldn't have admin access", async function () {
            const getAdminRole = await faucet.DEFAULT_ADMIN_ROLE()
            const hasAdminRole = await faucet.hasRole(getAdminRole,deployer.address);
            expect(hasAdminRole).is.false;
        });

        
        describe("Grant / Revoke Admin Role", function () {

            it("Should able add new admin", async function () {
                // chcek that new address has already admin role
                const getAdminRole = await zeroToken.DEFAULT_ADMIN_ROLE()
                const hasAdminRole = await zeroToken.hasRole(getAdminRole,newAdmnin.address);
                expect(hasAdminRole).is.false;

                // granting admin role
                await zeroToken.connect(admin).grantRole(getAdminRole,newAdmnin.address);

                //check admin role is granted
                const hasGotAdminRole = await zeroToken.hasRole(getAdminRole,newAdmnin.address);
                expect(hasGotAdminRole).is.true;
            });

            it("Should able add remove admin", async function () {
                // chcek that new address has already admin role
                const getAdminRole = await zeroToken.DEFAULT_ADMIN_ROLE()
                const hasAdminRole = await zeroToken.hasRole(getAdminRole,newAdmnin.address);
                expect(hasAdminRole).is.false;

                //granting admin role
                await zeroToken.connect(admin).grantRole(getAdminRole,newAdmnin.address);

                //check admin role is granted
                const hasGotAdminRole = await zeroToken.hasRole(getAdminRole,newAdmnin.address);
                expect(hasGotAdminRole).is.true;

                // revoking admin role
                await zeroToken.connect(admin).revokeRole(getAdminRole,newAdmnin.address);

                //check admin role has revoked
                const hasRemovedAdminRole = await zeroToken.hasRole(getAdminRole,newAdmnin.address);
                expect(hasRemovedAdminRole).is.false

            });

        });
    });

    describe("Check Faucet has token balance to serve", function () {

        it("Should have ZeroToken Balance", async function () {
            const amount = ethers.parseEther("100");
            console.log(zeroToken.address);
            console.log(faucet.address);
            await zeroToken.connect(admin).mint(faucet.address, amount);
            expect(await zeroToken.balanceOf(faucet.address)).to.equal(amount);
            
        });

        it("Should have OneToken Balance", async function () {
            const amount = ethers.parseEther("100");
            await oneToken.connect(admin).mint(faucet.address, amount);
            expect(await oneToken.balanceOf(faucet.address)).to.equal(amount);
        });

    });

});
