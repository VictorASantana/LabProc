let vectorT16 = ["ADD", "SUB", "MOV", "B", "BL", "UND"]
let matrixA32 = [["ADD", "SUB", "MOV", "B", "BL", "AND", "RSB", "SWI"],
[0, 1, 2, 3, 4, 5, 5, 5]]
let vectorCond = ["EQ", "NE", "CS", "HS", "CC", "LO", "MI", "PL", "VS", "VC", "HI", "LS", "GE", "LT", "GT", "LE", "AL", "S"]



const ArmToThumb = (inst: string) => {
    let vectorInst = inst.split(' ')

    let opcodeT16 = GetOpcodeT16(vectorInst[0])

    switch (opcodeT16) {
        case "MOV":
            opcodeT16 = verifyMOV(vectorInst);
            vectorInst.splice(3, 1)
            inst = vectorInst.toString().replace(/,,/g, ', ').replace(/,/, ' ')
            break;
        case "B":
            break;
        case "BL":
            break;
        default:
            break;
    }

    if (opcodeT16 != "UEPA") {
        let operandsT16 = inst.slice(vectorInst[0].length)
        return opcodeT16 + operandsT16;
    }

    return "UEPA"
}

const simplifyOpcodeA32 = (opcodeA32: string) => {
    for (let i = 1; i < 6; i++) {
        let auxSliced = opcodeA32.slice(0, i)
        let auxExtra = opcodeA32.slice(i)

        if (matrixA32[0].some(x => x === auxSliced) && vectorCond.some(x => x === auxExtra)) {
            return auxSliced
        }
    }

    return "XABU"

}

const GetOpcodeT16 = (opcodeA32: string) => {
    opcodeA32 = simplifyOpcodeA32(opcodeA32);
    let instPos = matrixA32[0].findIndex(x => x === opcodeA32)

    if (instPos >= 0) {
        return vectorT16[Number(matrixA32[1][instPos])]
    }

    return "UEPA"
}

const verifyMOV = (vectorInst: string[]) => {

    if (vectorInst.length > 3) {
        return vectorInst[3]
    }

    return "MOV"
}

let teste1 = ArmToThumb("ADDS R0, R0, #2")
let teste2 = ArmToThumb("MOVLE R1, R1, LSL #Offset5")
let teste3 = ArmToThumb("BLEQ R7")

console.log(teste1 + "\n" + teste2 + "\n" + teste3)

// TAMANHO DE REGISTRADORES (Hi e Lo)