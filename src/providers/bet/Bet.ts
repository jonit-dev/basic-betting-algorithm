import { provide } from "inversify-binding-decorators";
import _ from "lodash";
interface IBettor {
  address: string;
  team: string;
  value: number; // in ETH
  payout?: number;
}

interface IBetInfo {
  [team: string]: {
    bettors: IBettor[];
    totalValue: number;
    totalBettors: number;
    odds: number;
  };
}

@provide(Bet)
export class Bet {
  private betInfo: IBetInfo = {};
  private totalValue: number = 0;

  constructor(private allowedTeams: string[]) {
    for (const team of allowedTeams) {
      this.betInfo[team] = {
        bettors: [],
        totalValue: 0,
        totalBettors: 0,
        odds: 0,
      };
    }
  }

  public placeBet(bettor: IBettor): void {
    console.log("🍀 Placing a bet for ", bettor);
    if (this.checkValidBet(bettor)) {
      this.betInfo[bettor.team].bettors.push(bettor);
      this.betInfo[bettor.team].totalValue += bettor.value;
      this.betInfo[bettor.team].totalBettors++;
      this.totalValue += bettor.value;

      console.log(`Total value of ${bettor.team} bets: ${this.betInfo[bettor.team].totalValue} ETH`);
      this.betInfo[bettor.team].odds = this.betInfo[bettor.team].totalValue / this.totalValue;

      this.updateOdds();
      console.log(this.betInfo);
      console.log("💎 === Current estimated payouts === 💎");

      for (const team of this.allowedTeams) {
        console.log(`>>> ${team}`);

        for (const bettor of this.betInfo[team].bettors) {
          console.log(
            `Address: ${bettor.address} | Team: ${team} | Original bet: ${bettor.value} | Est. Payout: ${_.round(
              this.estimatePayout(bettor, this.betInfo[bettor.team].totalValue).estimatedPayout,
              2
            )} ETH`
          );
        }
      }
    }
  }

  public pickWinner(winnerTeam: string): void {
    console.log(`🔮 Winner team was ${winnerTeam}... calculating the payout 🔮`);
    console.log(`>> Total smart contract value: ${this.totalValue} ETH`);

    // calculate percentage of each bettor's bet

    for (const bettor of this.betInfo[winnerTeam].bettors) {
      const { percentageRelatedToTotalBets, estimatedPayout } = this.estimatePayout(
        bettor,
        this.betInfo[winnerTeam].totalValue
      );

      bettor.payout = estimatedPayout;

      console.log(
        `>> ${bettor.address} won ${_.round(bettor.payout, 2)} ETH because he bet ${_.round(
          percentageRelatedToTotalBets * 100,
          2
        )}% of the total ${winnerTeam} bets. Original bet was: ${bettor.value} ETH. That's a ${_.round(
          (bettor.payout / bettor.value) * 100,
          2
        )}% gain `
      );
    }
  }

  private estimatePayout(
    bettor: IBettor,
    totalValue: number
  ): { percentageRelatedToTotalBets: number; estimatedPayout: number } {
    const percentageRelatedToTotalBets = bettor.value / totalValue;

    const estimatedPayout = percentageRelatedToTotalBets * this.totalValue;

    return {
      percentageRelatedToTotalBets,
      estimatedPayout,
    };
  }

  private updateOdds(): void {
    for (const [team, teamData] of Object.entries(this.betInfo)) {
      const newOdds = teamData.totalValue / this.totalValue;
      this.betInfo[team].odds = _.round(newOdds, 2);
    }
  }

  private checkValidBet(bettor: IBettor): boolean {
    if (bettor.value <= 0) {
      throw new Error("You cannot bet less than 0 ETH");
    }

    if (!this.allowedTeams.includes(bettor.team)) {
      throw new Error("You're trying to bet on an invalid team");
    }

    return true;
  }
}
