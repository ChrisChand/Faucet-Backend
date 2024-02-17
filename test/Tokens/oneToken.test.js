const { expect } = require("chai");

describe.only("One Token Smart Contract", function () {
    let oneToken;

    async function deployOneToken() {
        [deployer, admin, user1, user2, newAdmnin] = await ethers.getSigners()
        const OneToken = await hre.ethers.getContractFactory("OneToken");
        oneToken = await OneToken.deploy(admin.address)
    }

    beforeEach(async function () {
        await deployOneToken();
    });

    describe("Check Initial Supply and Owner", function () {

        it("Should have correct initial supply", async function () {
            const initialSupply = await oneToken.totalSupply();
            expect(initialSupply).to.equal(0);
        });

        it("Should have correct admin", async function () {
            const getAdminRole = await oneToken.DEFAULT_ADMIN_ROLE()
            const hasAdminRole = await oneToken.hasRole(getAdminRole,admin.address);
            expect(hasAdminRole).is.true;
        });

        it("Deployer shouldn't have admin access", async function () {
            const getAdminRole = await oneToken.DEFAULT_ADMIN_ROLE()
            const hasAdminRole = await oneToken.hasRole(getAdminRole,deployer.address);
            expect(hasAdminRole).is.false;
        });


    });

    describe("Check Token Name, Symbol, Decimal", function () {

        it("Should have correct token name", async function () {
            const tokenName = await oneToken.name();
            expect(tokenName).to.equal("OneToken");
        });

        it("Should have correct token symbol", async function () {
            const tokenSymbol = await oneToken.symbol();
            expect(tokenSymbol).to.equal("OTK");
        });

        it("Should have correct token decimal", async function () {
            const tokenDecimals = await oneToken.decimals();
            expect(tokenDecimals).to.equal(18);
        });
    });

    describe("Check Minting and Token Transfer", function () {

        it("Should able mint token by admin to user 1", async function () {
            const amount = ethers.parseEther("100")
            await oneToken.connect(admin).mint(user1.address,amount);
            expect(await oneToken.balanceOf(user1.address)).to.equal(amount);
        });

        it("Should able transfer token to user 2 by user 1", async function () {

            // first nint to user1 becoz contrcat will redeploy 
            // for each and every it clause becoz of beforeEach
            const amount = ethers.parseEther("100")
            await oneToken.connect(admin).mint(user1.address,amount);
            expect(await oneToken.balanceOf(user1.address)).to.equal(amount);

            // now user1 can transfer tokens becoz he has a balance to transfer
            const amountToTransfer = ethers.parseEther("40")
            const user1Balance = ethers.parseEther("60")
            await oneToken.connect(user1).transfer(user2.address,amountToTransfer);
            expect(await oneToken.balanceOf(user2.address)).to.equal(amountToTransfer);

            expect(await oneToken.balanceOf(user1.address)).to.equal(user1Balance);
        });

        it("Revert when non admin user try to mint", async function () {

            const amount = ethers.parseEther("100");
            try {
                // Attempt to mint by a non-admin user
                await oneToken.connect(user1).mint(user1.address, amount);
                // If no error occurred, fail the test
                assert.fail("Expected an error but mint was successful");
            } catch (error) {
                // Check if the error message or type matches your expectations
                expect(error.message).to.contain("revert"); // Change this based on the actual error message
            }
        })

        it("Revert when user2 try to transfer token without approval of user1 ", async function () {
            // first nint to user1 becoz contrcat will redeploy 
            // for each and every it clause becoz of beforeEach
            const amount = ethers.parseEther("100")
            await oneToken.connect(admin).mint(user1.address,amount);
            expect(await oneToken.balanceOf(user1.address)).to.equal(amount);

            const amountToAddress = ethers.parseEther("50");
            try {
                // Attempt to mint by a non-admin user
                await oneToken.connect(user2).transferFrom(user1.address, user2.address, amountToAddress);
                // If no error occurred, fail the test
                assert.fail("Expected an error but mint was successful");
            } catch (error) {
                // Check if the error message or type matches your expectations
                expect(error.message).to.contain("revert"); // Change this based on the actual error message
            }
        })

    });

    describe("Grant / Revoke Admin Role", function () {

        it("Should able add new admin", async function () {
            // chcek that new address has already admin role
            const getAdminRole = await oneToken.DEFAULT_ADMIN_ROLE()
            const hasAdminRole = await oneToken.hasRole(getAdminRole,newAdmnin.address);
            expect(hasAdminRole).is.false;

            // granting admin role
            await oneToken.connect(admin).grantRole(getAdminRole,newAdmnin.address);

            //check admin role is granted
            const hasGotAdminRole = await oneToken.hasRole(getAdminRole,newAdmnin.address);
            expect(hasGotAdminRole).is.true;
        });

        it("Should able add remove admin", async function () {
            // chcek that new address has already admin role
            const getAdminRole = await oneToken.DEFAULT_ADMIN_ROLE()
            const hasAdminRole = await oneToken.hasRole(getAdminRole,newAdmnin.address);
            expect(hasAdminRole).is.false;

            //granting admin role
            await oneToken.connect(admin).grantRole(getAdminRole,newAdmnin.address);

            //check admin role is granted
            const hasGotAdminRole = await oneToken.hasRole(getAdminRole,newAdmnin.address);
            expect(hasGotAdminRole).is.true;

            // revoking admin role
            await oneToken.connect(admin).revokeRole(getAdminRole,newAdmnin.address);

            //check admin role has revoked
            const hasRemovedAdminRole = await oneToken.hasRole(getAdminRole,newAdmnin.address);
            expect(hasRemovedAdminRole).is.false

        });

    });
});
